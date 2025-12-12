import { Webhook as WebhookIcon } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { LoadingState } from '@/components/loading-state';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WebhookSection } from '@/components/webhook-section';
import { FIRESTORE_COLLECTION_NAME } from '@/lib/constants';
import { getFirestore } from '@/lib/firestore-client';

export async function generateStaticParams() {
  // During static generation, avoid Firestore calls that may fail due to
  // google-auth-library compatibility issues. Return empty array to let pages
  // be generated dynamically instead.
  try {
    const firestore = await getFirestore();
    const slingshotCollection = firestore.collection(FIRESTORE_COLLECTION_NAME);
    const snapshot = await slingshotCollection.limit(100).get();
    const slugs = snapshot.docs.map((doc) => doc.id);
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.warn('Failed to generate static params for projects, falling back to dynamic generation:', error);
    // Return default slug to disable static generation for this route
    return [{ slug: FIRESTORE_COLLECTION_NAME }];
  }
}

async function ProjectContent({ slug }: { slug: string }) {
  const RESERVED_SLUGS = [
    'healthz',
    'api',
    'gcp',
    'cache',
    'webhooks',
    'jwt-decoder',
    'environment',
    'headers',
    'request-headers',
  ];

  if (RESERVED_SLUGS.includes(slug)) {
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title={slug}
        description={`Webhook project • Endpoint: /api/${slug}`}
      />

      <WebhookSection projectSlug={slug} />
    </div>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Suspense fallback={<LoadingState label="Loading webhooks..." />}>
      <ProjectContent slug={slug} />
    </Suspense>
  );
}
