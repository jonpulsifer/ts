import { Webhook } from 'lucide-react';
import Link from 'next/link';
import { CreateProjectButton } from '@/components/create-project-button';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WebhookSection } from '@/components/webhook-section';
import { projectExists } from '@/lib/projects-storage';
import { getWebhooks } from '@/lib/storage';

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
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <Webhook className="h-16 w-16 text-primary drop-shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
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
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <Webhook className="h-16 w-16 text-primary drop-shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Project Not Found
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              The project <code className="bg-muted px-1 rounded">{slug}</code>{' '}
              does not exist. Create it to start receiving webhooks at{' '}
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
  const { data: history } = await getWebhooks(slug);
  const initialWebhooks = history?.webhooks || [];

  // Generate webhook URL based on slug
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const webhookUrl = `${baseUrl}/api/${slug}`;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader title={slug} description={`Webhook endpoint for ${slug}`} />

      <WebhookSection
        projectSlug={slug}
        webhookUrl={webhookUrl}
        initialWebhooks={initialWebhooks}
      />
    </div>
  );
}
