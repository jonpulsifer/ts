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

export async function getFirestore() {
  const authClient = ExternalAccountClient.fromJSON(
    GCP_WORKLOAD_IDENTITY_EXTERNAL_ACCOUNT_CONFIG,
  );
  if (!authClient) {
    throw new Error(
      'Failed to create GCP workload identity external account client',
    );
  }

  // const targetClient = new Impersonated({
  //   sourceClient: authClient,
  //   targetPrincipal: GCP_SERVICE_ACCOUNT_EMAIL,
  //   lifetime: 30,
  //   delegates: [],
  //   targetScopes: ['https://www.googleapis.com/auth/cloud-platform'],
  //   projectId: GCP_PROJECT_ID,
  // });

  // await targetClient.getAccessToken();
  // await authClient.getAccessToken();

  return new Firestore({
    authClient,
    projectId: GCP_PROJECT_ID,
  });
}
