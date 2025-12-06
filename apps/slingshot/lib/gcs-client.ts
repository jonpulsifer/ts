import { Storage } from '@google-cloud/storage';
import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';

const GCP_WORKLOAD_IDENTITY_POOL_PROJECT_NUMBER = '629296473058';
const GCP_WORKLOAD_IDENTITY_POOL_ID = 'homelab';
const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = 'vercel';
const BUCKET_NAME = 'homelab-ng-free';
const IS_VERCEL = !!process.env.VERCEL;

let storageClient: Storage | null = null;
let authClientPromise: Promise<ExternalAccountClient> | null = null;

async function getWorkloadIdentityClient(): Promise<ExternalAccountClient> {
  if (authClientPromise) {
    return authClientPromise;
  }

  authClientPromise = (async () => {
    const audience = `//iam.googleapis.com/projects/${GCP_WORKLOAD_IDENTITY_POOL_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`;
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
  })();

  return authClientPromise;
}

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

export async function getBucket() {
  const storage = await getStorageClient();
  return storage.bucket(BUCKET_NAME);
}
