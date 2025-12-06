import { Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GCP_WORKLOAD_IDENTITY_POOL_PROJECT_NUMBER,
  getAudience,
  getAuthClient,
  getBucket,
  getSubjectToken,
} from '@/lib/gcs-client';
import GcpAuth from './_components/gcp-auth';

async function getPrincipalInfo() {
  try {
    const authClient = await getAuthClient();

    if (!authClient) {
      // For Application Default Credentials, get the email from the credentials
      const { GoogleAuth } = await import('google-auth-library');
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
      const client = await auth.getClient();
      const projectId = await auth.getProjectId();

      // Get the email address from the credentials
      let principal: string | null = null;

      // Method 1: Check if client has email property (service account)
      if ('email' in client && client.email) {
        principal = client.email as string;
      }

      // Method 2: Check credentials object for client_email (service account key)
      // This works for service account JSON keys
      if (!principal && 'credentials' in client) {
        const creds = (client as any).credentials;
        if (creds && typeof creds === 'object') {
          if (creds.client_email) {
            principal = creds.client_email;
          }
          // Also check the keyFilename which might give us a hint
          if (!principal && creds.keyFilename) {
            // Try to read the key file (if accessible)
            try {
              const fs = await import('node:fs/promises');
              const keyData = await fs.readFile(creds.keyFilename, 'utf-8');
              const keyJson = JSON.parse(keyData);
              if (keyJson.client_email) {
                principal = keyJson.client_email;
              }
            } catch {
              // Can't read key file, continue
            }
          }
        }
      }

      // Method 3: Try to get email from access token via userinfo endpoint (for user credentials)
      if (!principal) {
        try {
          const accessToken = await client.getAccessToken();
          if (accessToken.token) {
            // Try userinfo endpoint first (works for user credentials)
            const userInfoResponse = await fetch(
              'https://www.googleapis.com/oauth2/v2/userinfo',
              {
                headers: {
                  Authorization: `Bearer ${accessToken.token}`,
                },
              },
            );
            if (userInfoResponse.ok) {
              const userInfo = await userInfoResponse.json();
              if (userInfo.email) {
                principal = userInfo.email;
              }
            }

            // If userinfo didn't work, try tokeninfo endpoint
            if (!principal) {
              const tokenInfoResponse = await fetch(
                `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken.token}`,
              );
              if (tokenInfoResponse.ok) {
                const tokenInfo = await tokenInfoResponse.json();
                if (tokenInfo.email) {
                  principal = tokenInfo.email;
                } else if (tokenInfo.sub?.includes('@')) {
                  principal = tokenInfo.sub;
                }
              }
            }
          }
        } catch (_error) {
          // If API calls fail, try decoding the token
          try {
            const accessToken = await client.getAccessToken();
            if (accessToken.token) {
              const tokenParts = accessToken.token.split('.');
              if (tokenParts.length === 3) {
                const payload = JSON.parse(
                  Buffer.from(tokenParts[1], 'base64').toString(),
                );
                if (payload.email) {
                  principal = payload.email;
                } else if (payload.sub?.includes('@')) {
                  principal = payload.sub;
                } else if (payload.iss?.includes('@')) {
                  // Sometimes the issuer contains the email
                  principal = payload.iss;
                }
              }
            }
          } catch {
            // Will try next method
          }
        }
      }

      // Method 4: Try to get service account from Storage API
      if (!principal) {
        try {
          const { getBucket } = await import('@/lib/gcs-client');
          const bucket = await getBucket();
          // Try to get the service account email from bucket IAM
          // This is a bit of a hack but might work
          const [_iamPolicy] = await bucket.iam.getPolicy();
          // This won't directly give us the principal, but let's try another approach
        } catch {
          // Ignore errors
        }
      }

      // If we still don't have a principal, don't show "Project:" - show that we couldn't determine it
      if (!principal) {
        // Try one more time with a direct credentials inspection
        try {
          const creds = await auth.getCredentials();
          if (creds && 'client_email' in creds && creds.client_email) {
            principal = creds.client_email;
          }
        } catch {
          // Last resort: show that we couldn't determine it
          principal = 'Unable to determine principal';
        }
      }

      return {
        principal: principal || 'Unable to determine principal',
        projectId: projectId,
        type: 'Application Default Credentials',
      };
    }

    // For Workload Identity Federation, get the subject from the OIDC token
    const subjectToken = await getSubjectToken();
    if (subjectToken) {
      try {
        // Decode JWT to get subject
        const tokenParts = subjectToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(tokenParts[1], 'base64').toString(),
          );
          // The subject is typically in 'sub' field for OIDC tokens
          const subject = payload.sub || payload.subject;

          if (subject) {
            const audience = getAudience() || '';
            // Extract project number from audience or use default
            const projectMatch = audience.match(/projects\/(\d+)/);
            const projectNumber = projectMatch
              ? projectMatch[1]
              : GCP_WORKLOAD_IDENTITY_POOL_PROJECT_NUMBER;

            return {
              principal: `principal://iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/homelab/subject/${subject}`,
              projectId: projectNumber,
              type: 'Workload Identity Federation',
              subject: subject,
            };
          }
        }
      } catch (_error) {
        // If we can't decode, try to construct from audience
        const audience = getAudience() || '';
        const projectMatch = audience.match(/projects\/(\d+)/);
        const projectNumber = projectMatch
          ? projectMatch[1]
          : GCP_WORKLOAD_IDENTITY_POOL_PROJECT_NUMBER;

        return {
          principal: `principal://iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/homelab/subject/unknown`,
          projectId: projectNumber,
          type: 'Workload Identity Federation',
        };
      }
    }

    return {
      principal: 'Unknown authentication method',
      projectId: 'Unknown',
      type: 'Unknown',
    };
  } catch (error) {
    return {
      principal: `Error retrieving principal: ${error instanceof Error ? error.message : 'Unknown error'}`,
      projectId: 'Unknown',
      type: 'Error',
    };
  }
}

export default async function GcpPage() {
  // Get principal information
  const principalInfo = await getPrincipalInfo();

  let results: {
    success: boolean;
    files?: Array<{
      name: string;
      size: string;
      updated: string;
      contentType?: string;
    }>;
    totalFiles?: number;
    error?: string;
  };

  try {
    const bucket = await getBucket();

    // List files from the bucket (limit to 20 for display)
    const [files] = await bucket.getFiles({ maxResults: 20 });

    // Fetch metadata for each file
    const fileList = await Promise.all(
      files.map(async (file) => {
        const [metadata] = await file.getMetadata();
        return {
          name: file.name,
          size: metadata.size
            ? formatBytes(
                typeof metadata.size === 'string'
                  ? Number.parseInt(metadata.size, 10)
                  : metadata.size,
              )
            : 'Unknown',
          updated: metadata.updated
            ? new Date(metadata.updated).toLocaleString()
            : 'Unknown',
          contentType: metadata.contentType || 'Unknown',
        };
      }),
    );

    results = {
      success: true,
      files: fileList,
      totalFiles: fileList.length,
    };
  } catch (error) {
    results = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to list files from bucket',
    };
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Google Cloud Authentication"
        description="Test Google Cloud Platform authentication and view authenticated principal information"
      />
      <Suspense fallback={<Skeleton className="w-full h-[500px]" />}>
        <GcpAuth principalInfo={principalInfo} storageData={results} />
      </Suspense>
    </div>
  );
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}
