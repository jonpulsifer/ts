// GCP Configuration Constants
export const GCP_PROJECT_ID = 'homelab-ng';
export const GCP_PROJECT_NUMBER = '629296473058';
export const GCP_WORKLOAD_IDENTITY_POOL = 'homelab';
export const GCP_WORKLOAD_IDENTITY_PROVIDER = 'vercel';

// Application Constants
export const FIRESTORE_COLLECTION_NAME = 'slingshot';
export const WEBHOOKS_SUBCOLLECTION_NAME = 'webhooks';

// OAuth/OIDC Constants
export const OAUTH_SUBJECT_TOKEN_TYPE = 'urn:ietf:params:oauth:token-type:jwt';
export const OAUTH_TOKEN_URL = 'https://sts.googleapis.com/v1/token';

// Derived constants
export const GCP_WORKLOAD_IDENTITY_AUDIENCE = `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WORKLOAD_IDENTITY_POOL}/providers/${GCP_WORKLOAD_IDENTITY_PROVIDER}`;

// Environment detection
export const IS_VERCEL = !!process.env.VERCEL;
