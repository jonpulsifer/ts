import { Storage } from '@google-cloud/storage';
import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';

export const GCP_WORKLOAD_IDENTITY_POOL_PROJECT_NUMBER = '629296473058';
export const GCP_WORKLOAD_IDENTITY_POOL_ID = 'homelab';
export const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = 'vercel';
const BUCKET_NAME = 'homelab-ng-free';

const IS_VERCEL = !!process.env.VERCEL;
const IS_BUILD_TIME =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  (process.env.NODE_ENV === 'production' && !process.env.VERCEL);

/**
 * Custom error class for GCS unavailability
 */
export class GcsUnavailableError extends Error {
  constructor(
    message = 'GCS client not available: authentication credentials required',
  ) {
    super(message);
    this.name = 'GcsUnavailableError';
  }
}

/**
 * Check if GCS is available in the current environment
 */
export function isGcsAvailable(): boolean {
  // During build time when not on Vercel, GCS is not available
  if (IS_BUILD_TIME && !IS_VERCEL) {
    return false;
  }
  // On Vercel, GCS should be available via Workload Identity
  if (IS_VERCEL) {
    return true;
  }
  // In local dev, check for Application Default Credentials
  return !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

/**
 * Check if an error indicates GCS is unavailable
 */
export function isGcsUnavailableError(error: unknown): boolean {
  if (error instanceof GcsUnavailableError) {
    return true;
  }
  if (error instanceof Error) {
    return (
      error.message.includes('URL is required') ||
      error.message.includes('GCS client not available') ||
      error.message.includes('authentication credentials required')
    );
  }
  return false;
}

/**
 * Check if an error is a GCS "not found" error (file doesn't exist)
 */
export function isGcsNotFoundError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as {
      code?: number;
      statusCode?: number;
      message?: string;
    };
    return (
      err.code === 404 ||
      err.statusCode === 404 ||
      (typeof err.message === 'string' &&
        (err.message.includes('404') ||
          err.message.includes('not found') ||
          err.message.includes('does not exist')))
    );
  }
  return false;
}

/**
 * Check if an error is a GCS auth/permission error
 */
export function isGcsAuthError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as {
      code?: number;
      statusCode?: number;
      message?: string;
    };
    return (
      err.code === 401 ||
      err.code === 403 ||
      err.statusCode === 401 ||
      err.statusCode === 403 ||
      (typeof err.message === 'string' &&
        (err.message.includes('Permission') ||
          err.message.includes('access') ||
          err.message.includes('denied') ||
          err.message.includes('Anonymous caller')))
    );
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
    throw new GcsUnavailableError('Failed to create Workload Identity client');
  }
  return authClient;
}

let storageClient: Storage | null = null;

/**
 * Get the Storage client instance
 * @throws {GcsUnavailableError} if GCS is not available
 */
export async function getStorageClient(): Promise<Storage> {
  if (storageClient) {
    return storageClient;
  }

  if (!isGcsAvailable()) {
    throw new GcsUnavailableError();
  }

  try {
    const authClient = IS_VERCEL
      ? await getWorkloadIdentityClient()
      : undefined;

    storageClient = new Storage({
      authClient: authClient as any,
    });

    return storageClient;
  } catch (error) {
    // If Storage constructor fails or auth fails, wrap in our error type
    if (isGcsUnavailableError(error)) {
      throw error;
    }
    // Check for common initialization errors
    if (error instanceof Error) {
      if (
        error.message.includes('URL is required') ||
        error.message.includes('credentials') ||
        error.message.includes('authentication')
      ) {
        throw new GcsUnavailableError(error.message);
      }
    }
    throw error;
  }
}

/**
 * Get a bucket instance
 * @throws {GcsUnavailableError} if GCS is not available
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
  if (!isGcsAvailable()) {
    throw new GcsUnavailableError();
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
