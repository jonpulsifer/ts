import { Loader2, Webhook as WebhookIcon } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Suspense } from 'react';
import { CreateProjectButton } from '@/components/create-project-button';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WebhookSectionWrapper } from '@/components/webhook-section-wrapper';
import { getBaseUrl } from '@/lib/base-url';
import { projectExists } from '@/lib/projects-storage';

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

  const headersList = await headers();
  const baseUrl = await getBaseUrl(headersList);
  const webhookUrl = `${baseUrl}/api/${slug}`;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title={slug}
        description={`Webhook project • Endpoint: /api/${slug}`}
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
              <p className="text-sm text-muted-foreground">
                Loading webhooks...
              </p>
            </div>
          </div>
        }
      >
        <WebhookSectionWrapper projectSlug={slug} webhookUrl={webhookUrl} />
      </Suspense>
    </div>
  );
}
