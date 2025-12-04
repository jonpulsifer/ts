import { BigQuery } from '@google-cloud/bigquery';
import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';
import { Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import GcpAuth from './_components/gcp-auth';

const GCP_WORKLOAD_IDENTITY_POOL_PROJECT_NUMBER =
  process.env.GCP_WORKLOAD_IDENTITY_POOL_PROJECT_NUMBER || '629296473058';
const GCP_WORKLOAD_IDENTITY_POOL_ID =
  process.env.GCP_WORKLOAD_IDENTITY_POOL_ID || 'homelab';
const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID =
  process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID || 'vercel';
const BIGQUERY_PROJECT_ID = 'firebees';

async function getWorkloadIdentityClient() {
  // Production: Use OIDC token with subject from sub claim
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
}

export default async function GcpPage() {
  const isVercel = !!process.env.VERCEL;

  const authClient = isVercel ? await getWorkloadIdentityClient() : undefined;

  const bigquery = new BigQuery({
    projectId: BIGQUERY_PROJECT_ID,
    authClient,
  });

  const query =
    'SELECT name FROM `firebees.wishlist.gifts-export-2023` LIMIT 5';
  const [job] = await bigquery.createQueryJob({ query });
  const [rows] = await job.getQueryResults();

  const bigQuery = {
    success: true,
    rows,
    query,
    totalRows: rows.length,
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="GCP Authentication"
        description="Test Google Cloud Platform authentication using Workload Identity Federation"
      />
      <Suspense fallback={<Skeleton className="w-full h-[500px]" />}>
        <GcpAuth isVercel={isVercel} bigQuery={bigQuery} />
      </Suspense>
    </div>
  );
}
