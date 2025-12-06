import { Storage } from '@google-cloud/storage';
import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';

export const GCP_WORKLOAD_IDENTITY_POOL_PROJECT_NUMBER = '629296473058';
export const GCP_WORKLOAD_IDENTITY_POOL_ID = 'homelab';
export const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = 'vercel';
const BUCKET_NAME = 'homelab-ng-free';
const IS_VERCEL = !!process.env.VERCEL;

function getWorkloadIdentityAudience(): string {
  return `//iam.googleapis.com/projects/${GCP_WORKLOAD_IDENTITY_POOL_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`;
}

async function getWorkloadIdentityClient(): Promise<ExternalAccountClient> {
  const audience = getWorkloadIdentityAudience();
  const authClientConfig = {
    type: 'external_account' as const,
    audience,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    subject_token_supplier: { getSubjectToken: getVercelOidcToken },
  };
  const authClient = ExternalAccountClient.fromJSON(authClientConfig);
  if (!authClient) {
    throw new Error('Failed to create Workload Identity client');
  }
  return authClient;
}

let storageClient: Storage | null = null;

export async function getStorageClient(): Promise<Storage> {
  if (storageClient) {
    return storageClient;
  }

  try {
    const authClient = IS_VERCEL
      ? await getWorkloadIdentityClient()
      : undefined;

    storageClient = new Storage({
      authClient: authClient as any,
    });

    return storageClient;
  } catch (error: any) {
    // During build time or when credentials aren't available, throw a more descriptive error
    // that can be caught by calling code
    if (
      error?.message?.includes('URL is required') ||
      error?.message?.includes('credentials') ||
      error?.message?.includes('authentication') ||
      (!IS_VERCEL && !process.env.GOOGLE_APPLICATION_CREDENTIALS)
    ) {
      throw new Error(
        'GCS client not available: authentication credentials required',
      );
    }
    throw error;
  }
}

export async function getBucket() {
  const storage = await getStorageClient();
  return storage.bucket(BUCKET_NAME);
}

export async function getAuthClient() {
  if (IS_VERCEL) {
    return await getWorkloadIdentityClient();
  }
  return undefined;
}

/**
 * Get the subject token for Workload Identity Federation.
 * This is only available when running on Vercel.
 */
export async function getSubjectToken(): Promise<string | null> {
  if (!IS_VERCEL) {
    return null;
  }
  try {
    return await getVercelOidcToken();
  } catch {
    return null;
  }
}

/**
 * Get the audience for Workload Identity Federation.
 */
export function getAudience(): string | null {
  if (!IS_VERCEL) {
    return null;
  }
  return getWorkloadIdentityAudience();
}
