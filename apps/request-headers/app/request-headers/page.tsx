import { headers } from 'next/headers';
import { Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import RequestHeaders from './_components/request-headers';

export default async function RequestHeadersPage() {
  const headersList = await headers();
  const requestHeaders = Object.fromEntries(
    Array.from(headersList.entries()).sort(([a], [b]) => a.localeCompare(b)),
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Request Headers"
        description="Inspect HTTP headers sent with your request"
      />
      <Suspense fallback={<Skeleton className="w-full h-[500px]" />}>
        <RequestHeaders requestHeaders={requestHeaders} />
      </Suspense>
    </div>
  );
}
