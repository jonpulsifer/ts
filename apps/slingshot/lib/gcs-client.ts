import { Storage } from '@google-cloud/storage';
import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';

const GCP_WORKLOAD_IDENTITY_POOL_PROJECT_NUMBER = '629296473058';
const GCP_WORKLOAD_IDENTITY_POOL_ID = 'homelab';
const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = 'vercel';
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
  try {
    const audience = getWorkloadIdentityAudience();
    console.log('[GCS] Creating Workload Identity client with audience:', audience);
    
    // Test that we can get a token before creating the client
    try {
      const testToken = await getVercelOidcToken();
      if (!testToken) {
        throw new Error('getVercelOidcToken returned null/undefined');
      }
      console.log('[GCS] Successfully obtained Vercel OIDC token');
    } catch (tokenError) {
      console.error('[GCS] Failed to obtain Vercel OIDC token:', tokenError);
      throw new Error(
        `Failed to obtain Vercel OIDC token: ${tokenError instanceof Error ? tokenError.message : String(tokenError)}`,
      );
    }

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
    console.log('[GCS] Successfully created Workload Identity client');
    return authClient;
  } catch (error) {
    console.error('[GCS] Error creating Workload Identity client:', error);
    throw error;
  }
}

let storageClient: Storage | null = null;
let storageClientAuthInitialized = false;

/**
 * Get the Storage client instance
 * Assumes valid GCP credentials are available (either via default client or OIDC token)
 */
export async function getStorageClient(): Promise<Storage> {
  // Only reuse cached client if it was properly initialized with auth
  if (storageClient && storageClientAuthInitialized) {
    return storageClient;
  }
  
  // Reset if we had a client but auth wasn't initialized (shouldn't happen, but safety check)
  if (storageClient && !storageClientAuthInitialized) {
    console.warn('[GCS] Resetting Storage client - previous instance was not properly authenticated');
    storageClient = null;
  }

  console.log(`[GCS] Initializing Storage client (IS_VERCEL=${IS_VERCEL})`);

  let authClient: ExternalAccountClient | undefined;
  
  if (IS_VERCEL) {
    try {
      authClient = await getWorkloadIdentityClient();
    } catch (error) {
      console.error(
        '[GCS] Failed to create Workload Identity client on Vercel:',
        error,
      );
      throw new Error(
        `GCS authentication failed on Vercel: ${error instanceof Error ? error.message : String(error)}. Ensure Workload Identity Federation is properly configured.`,
      );
    }
  } else {
    console.log('[GCS] Not on Vercel, using default credentials');
  }

  if (IS_VERCEL && !authClient) {
    throw new Error(
      'Failed to initialize GCS authentication: authClient is undefined on Vercel',
    );
  }

  storageClient = new Storage({
    authClient: authClient as any,
  });
  
  storageClientAuthInitialized = true;
  console.log('[GCS] Storage client initialized successfully');
  return storageClient;
}

/**
 * Get a bucket instance
 */
export async function getBucket() {
  const storage = await getStorageClient();
  return storage.bucket(BUCKET_NAME);
}
