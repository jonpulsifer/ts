import { Code, Loader2, Webhook } from 'lucide-react';
import { Suspense } from 'react';

import { PageHeader } from '@/components/page-header';
import { ProjectsList } from '@/components/projects-list';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title="Quick Start"
        description="Get started with Slingshot • Capture, inspect, diff, and replay webhooks safely"
      />

      {/* What is Slingshot Section */}
      <Card className="border border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Webhook className="h-6 w-6 text-primary" />
            What is Slingshot?
          </CardTitle>
          <CardDescription>
            Slingshot is a webhook testing and debugging platform that helps you
            capture, inspect, and test webhooks from any service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                How it works
              </h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>
                  Create a webhook project (each project gets a unique endpoint)
                </li>
                <li>
                  Configure your service to send webhooks to your project URL
                </li>
                <li>
                  View incoming webhooks in real-time with full request details
                </li>
                <li>Inspect headers, body, and metadata</li>
                <li>Resend webhooks to test your endpoints</li>
              </ol>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Webhook className="h-4 w-4 text-primary" />
                Features
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Live webhook stream powered by SSE with smart caching</li>
                <li>Headers, body, response, and raw payload inspection</li>
                <li>
                  Color-coded inline and side-by-side diffs between events
                </li>
                <li>One-click exports to HTTPie, cURL, or Burp</li>
                <li>Client-side replay to any target (SSRF-safe)</li>
                <li>
                  Supports every HTTP method (GET, POST, PUT, DELETE, etc.)
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Examples */}
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
        <ProjectsList />
      </Suspense>
    </div>
  );
}
