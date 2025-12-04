import { Separator } from '@radix-ui/react-separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import GcpAuth from './_components/gcp-auth';
import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';
import { BigQuery } from '@google-cloud/bigquery';

const GCP_WORKLOAD_IDENTITY_POOL_PROJECT_NUMBER = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROJECT_NUMBER || '629296473058';
const GCP_WORKLOAD_IDENTITY_POOL_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID || 'homelab';
const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID || 'vercel';
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
  const starColor = 'text-yellow-300 hover:animate-ping hover:text-pink-600';

  const isVercel = !!process.env.VERCEL;

  const authClient = isVercel ? await getWorkloadIdentityClient() : undefined;

  const bigquery = new BigQuery({
    projectId: BIGQUERY_PROJECT_ID,
    authClient,
  });

  const query = `SELECT name FROM \`firebees.wishlist.gifts-export-2023\` LIMIT 5`;
  const [job] = await bigquery.createQueryJob({ query });
  const [rows] = await job.getQueryResults();

  const bigQuery = {
    success: true,
    rows,
    query,
    totalRows: rows.length,
  };

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>GCP Auth</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <h1 className="text-md sm:text-2xl md:text-3xl lg:text-4xl tracking-tight font-extrabold pt-4 mb-4">
        <span>(∩ ͡° ͜ʖ ͡°)⊃</span>
        <span className="text-indigo-600">━</span>
        <span className="font-mono text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-pink-600">
          <span className={starColor}>⭑</span>·~-.¸.·~
          <span className={starColor}>⭒</span>·._.·
        </span>
        <span className={starColor}>☆</span>
      </h1>
      <Suspense fallback={<Skeleton className="w-full h-[500px]" />}>
        <GcpAuth isVercel={isVercel} bigQuery={bigQuery} />
      </Suspense>
    </div>
  );
}
