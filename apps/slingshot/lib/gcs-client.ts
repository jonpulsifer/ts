import { Storage } from '@google-cloud/storage';
import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';

export const GCP_WORKLOAD_IDENTITY_POOL_PROJECT_NUMBER = '629296473058';
export const GCP_WORKLOAD_IDENTITY_POOL_ID = 'homelab';
export const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = 'vercel';
const BUCKET_NAME = 'homelab-ng-free';

const IS_VERCEL = !!process.env.VERCEL;

/**
 * Check if an error indicates GCS is unavailable (e.g., during build when URL is required)
 */
export function isGcsUnavailableError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('URL is required');
  }
  return false;
}

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

/**
 * Get the Storage client instance
 * Assumes valid GCP credentials are available (either via default client or OIDC token)
 */
export async function getStorageClient(): Promise<Storage> {
  if (storageClient) {
    return storageClient;
  }

  const authClient = IS_VERCEL ? await getWorkloadIdentityClient() : undefined;

  storageClient = new Storage({
    authClient: authClient as any,
  });

  return storageClient;
}

/**
 * Get a bucket instance
 */
export async function getBucket() {
  const storage = await getStorageClient();
  return storage.bucket(BUCKET_NAME);
}

/**
 * Get the auth client for Workload Identity Federation
 * Returns undefined if not on Vercel
 */
export async function getAuthClient(): Promise<
  ExternalAccountClient | undefined
> {
  if (!IS_VERCEL) {
    return undefined;
  }
  return await getWorkloadIdentityClient();
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
