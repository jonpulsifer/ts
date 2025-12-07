import { Firestore } from '@google-cloud/firestore';
import { getVercelOidcToken } from '@vercel/oidc';
import {
  ExternalAccountClient,
  type ExternalAccountClientOptions,
} from 'google-auth-library';

const GCP_PROJECT_ID = 'homelab-ng';
const GCP_PROJECT_NUMBER = '629296473058';
const GCP_WORKLOAD_IDENTITY_POOL = 'homelab';
const GCP_WORKLOAD_IDENTITY_PROVIDER = 'vercel';
const GCP_WORKLOAD_IDENTITY_AUDIENCE = `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WORKLOAD_IDENTITY_POOL}/providers/${GCP_WORKLOAD_IDENTITY_PROVIDER}`;
const _GCP_SERVICE_ACCOUNT_EMAIL =
  'slingshot@homelab-ng.iam.gserviceaccount.com';
const IS_CI = !!process.env.CI;

const GCP_WORKLOAD_IDENTITY_EXTERNAL_ACCOUNT_CONFIG = {
  type: 'external_account',
  audience: GCP_WORKLOAD_IDENTITY_AUDIENCE,
  subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
  token_url: 'https://sts.googleapis.com/v1/token',
  // service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
  subject_token_supplier: { getSubjectToken: getVercelOidcToken },
} as ExternalAccountClientOptions;

// Cache for auth client and Firestore instance (useful for containerized environments)
let cachedAuthClient: ExternalAccountClient | null = null;
let cachedFirestore: Firestore | null = null;

export const shouldSkipFirestoreOperations = () => IS_CI;

export const isFirestoreUnavailableError = (error: unknown) => {
  const err = error as { code?: number | string; message?: string };
  if (!err) return false;
  if (err.code === 401 || err.code === 403 || err.code === 404) return true;
  const msg = err.message || '';
  return (
    msg.includes('Missing or insufficient permissions') ||
    msg.includes('Caller does not have permission') ||
    msg.includes('unauthorized')
  );
};

/**
 * Get or create a cached auth client
 * This is useful for containerized environments or when running off Vercel
 * where we want to reuse the auth client across requests
 */
function getAuthClient(): ExternalAccountClient {
  if (!cachedAuthClient) {
    cachedAuthClient = ExternalAccountClient.fromJSON(
      GCP_WORKLOAD_IDENTITY_EXTERNAL_ACCOUNT_CONFIG,
    );
    if (!cachedAuthClient) {
      throw new Error(
        'Failed to create GCP workload identity external account client',
      );
    }
  }
  return cachedAuthClient;
}

/**
 * Get or create a cached Firestore instance
 * Reuses the cached auth client for better performance in containerized environments
 */
export async function getFirestore(): Promise<Firestore> {
  if (!cachedFirestore) {
    const authClient = getAuthClient();
    cachedFirestore = new Firestore({
      authClient,
      projectId: GCP_PROJECT_ID,
    });
  }
  return cachedFirestore;
}
