import { Webhook as WebhookIcon } from 'lucide-react';
import Link from 'next/link';
import { CreateProjectButton } from '@/components/create-project-button';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WebhookSection } from '@/components/webhook-section';
import { projectExists } from '@/lib/projects-storage';

import type { Webhook } from '@/lib/types';

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Skip reserved routes
  if (slug === 'health' || slug === 'api' || slug === 'projects') {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <PageHeader title="Not Found" description="This endpoint is reserved" />
        <Card className="border border-border/50 bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted/50 p-6 mb-4">
              <WebhookIcon className="h-16 w-16 text-primary drop-shadow-[0_0_6px_rgba(139,92,246,0.4)]" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Invalid Endpoint
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              The endpoint{' '}
              <code className="bg-muted px-1 rounded">/{slug}</code> is reserved
              and cannot be used as a project slug.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if project exists (slug is the ID)
  const exists = await projectExists(slug);

  // If project doesn't exist, show empty state
  if (!exists) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <PageHeader title={slug} description="Project not found" />
        <Card className="border border-border/50 bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted/50 p-6 mb-4">
              <WebhookIcon className="h-16 w-16 text-primary drop-shadow-[0_0_6px_rgba(139,92,246,0.4)]" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Webhook Project Not Found
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              The webhook project{' '}
              <code className="bg-muted px-1 rounded">{slug}</code> does not
              exist. Create it to start receiving webhooks at{' '}
              <code className="bg-muted px-1 rounded">/api/{slug}</code>.
            </p>
            <div className="flex gap-3">
              <CreateProjectButton slug={slug} />
              <Link href="/">
                <Button variant="outline">Go Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch initial webhooks (slug is the project ID)
  // We intentionally DON'T wait for GCS here to allow instant navigation
  // The client component will pick up from localStorage or fetch via SWR
  const initialWebhooks: Webhook[] = [];

  // Generate webhook URL based on slug
  const { BASE_URL } = await import('@/lib/base-url');
  const webhookUrl = `${BASE_URL}/api/${slug}`;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title={slug}
        description={`Webhook project • Endpoint: /api/${slug}`}
      />

      <WebhookSection
        projectSlug={slug}
        webhookUrl={webhookUrl}
        initialWebhooks={initialWebhooks}
      />
    </div>
  );
}
