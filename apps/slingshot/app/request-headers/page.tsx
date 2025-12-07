import { Loader2 } from 'lucide-react';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { sanitizeHeaders } from '@/lib/sanitize-headers';
import RequestHeaders from './_components/request-headers';

export default async function RequestHeadersPage() {
  const headersList = await headers();
  const rawHeaders = Object.fromEntries(
    Array.from(headersList.entries()).sort(([a], [b]) => a.localeCompare(b)),
  );
  const requestHeaders = sanitizeHeaders(rawHeaders);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Request Headers"
        description="Inspect HTTP headers sent with your request"
      />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="absolute inset-0 h-8 w-8 animate-spin text-primary/20">
                  <Loader2 className="h-8 w-8" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        }
      >
        <RequestHeaders requestHeaders={requestHeaders} />
      </Suspense>
    </div>
  );
}
