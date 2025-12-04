import { Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import WebhookDisplay from './_components/webhook-display';

export default function WebhookPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Webhook Testing"
        description="Test webhooks and inspect incoming requests in real-time"
      />
      <Suspense fallback={<Skeleton className="w-full h-[500px]" />}>
        <WebhookDisplay />
      </Suspense>
    </div>
  );
}
