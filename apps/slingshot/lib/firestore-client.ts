import { Firestore } from '@google-cloud/firestore';
import { getVercelOidcToken } from '@vercel/oidc';
import {
  ExternalAccountClient,
  type ExternalAccountClientOptions,
} from 'google-auth-library';
import {
  GCP_PROJECT_ID,
  GCP_WORKLOAD_IDENTITY_AUDIENCE,
  IS_VERCEL,
  OAUTH_SUBJECT_TOKEN_TYPE,
  OAUTH_TOKEN_URL,
} from './constants';

const GCP_WORKLOAD_IDENTITY_EXTERNAL_ACCOUNT_CONFIG = {
  type: 'external_account',
  audience: GCP_WORKLOAD_IDENTITY_AUDIENCE,
  subject_token_type: OAUTH_SUBJECT_TOKEN_TYPE,
  token_url: OAUTH_TOKEN_URL,
  // service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
  subject_token_supplier: { getSubjectToken: getVercelOidcToken },
} as ExternalAccountClientOptions;

// Cache for auth client and Firestore instance (useful for containerized environments)
let cachedAuthClient: ExternalAccountClient | null = null;
let cachedDefaultFirestore: Firestore | null = null;
let cachedExternalFirestore: Firestore | null = null;

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
 * Uses default client in non-production, external auth client in production
 */
export async function getFirestore(): Promise<Firestore> {
  if (IS_VERCEL) {
    if (!cachedExternalFirestore) {
      const authClient = getAuthClient();
      cachedExternalFirestore = new Firestore({
        authClient,
        projectId: GCP_PROJECT_ID,
      });
    }
    return cachedExternalFirestore;
  }
  if (!cachedDefaultFirestore) {
    cachedDefaultFirestore = new Firestore({
      projectId: GCP_PROJECT_ID,
    });
  }
  return cachedDefaultFirestore;
}
