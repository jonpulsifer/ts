import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { getWebhooksAction } from '@/lib/actions';
import type { Webhook } from '@/lib/types';
import { WebhookSection } from './webhook-section';

async function WebhookSectionContent({
  projectSlug,
  webhookUrl,
}: {
  projectSlug: string;
  webhookUrl: string;
}) {
  let initialWebhooks: Webhook[] = [];
  let initialWebhookEtag: string | null = null;
  let initialWebhookMaxSize = 100;

  try {
    const result = await getWebhooksAction(projectSlug);
    initialWebhooks = result.webhooks;
    initialWebhookEtag = result.etag || null;
    initialWebhookMaxSize = result.maxSize || 100;
  } catch (error) {
    console.error('Failed to fetch initial webhooks:', error);
  }

  return (
    <WebhookSection
      projectSlug={projectSlug}
      webhookUrl={webhookUrl}
      initialWebhooks={initialWebhooks}
      initialEtag={initialWebhookEtag}
      initialMaxSize={initialWebhookMaxSize}
    />
  );
}

function WebhookSectionSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="absolute inset-0 h-8 w-8 animate-spin text-primary/20">
            <Loader2 className="h-8 w-8" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Loading webhooks...</p>
      </div>
    </div>
  );
}

export function WebhookSectionWrapper({
  projectSlug,
  webhookUrl,
}: {
  projectSlug: string;
  webhookUrl: string;
}) {
  return (
    <Suspense fallback={<WebhookSectionSpinner />}>
      <WebhookSectionContent
        projectSlug={projectSlug}
        webhookUrl={webhookUrl}
      />
    </Suspense>
  );
}
