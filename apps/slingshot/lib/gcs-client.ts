import { Storage } from '@google-cloud/storage';
import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';

const audience =
  '//iam.googleapis.com/projects/629296473058/locations/global/workloadIdentityPools/homelab/providers/vercel';
const BUCKET_NAME = 'homelab-ng-free';
const IS_CI = !!process.env.CI;
const IS_VERCEL = !!process.env.VERCEL;

export const shouldSkipGcsOperations = () => IS_CI;
export const isGcsUnavailableError = (e: unknown) =>
  e instanceof Error && e.message.includes('URL is required');

async function getAuthClient() {
  return ExternalAccountClient.fromJSON({
    type: 'external_account',
    audience,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    subject_token_supplier: { getSubjectToken: getVercelOidcToken },
  });
}

export async function getStorageClient() {
  const authClient = IS_VERCEL ? await getAuthClient() : undefined;
  return new Storage(authClient ? { authClient: authClient as any } : {});
}

export async function getBucket() {
  return (await getStorageClient()).bucket(BUCKET_NAME);
}
