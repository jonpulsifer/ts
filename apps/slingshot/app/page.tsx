import { Code, Webhook } from 'lucide-react';
import { headers } from 'next/headers';

import { HowToUseExamples } from '@/components/how-to-use-examples';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getBaseUrl } from '@/lib/base-url';
import { ensureDefaultProject, getAllProjects } from '@/lib/projects-storage';

export default async function Home() {
  // Ensure default project exists (handles GCS unavailability gracefully)
  await ensureDefaultProject();
  const projects = await getAllProjects();
  const defaultProject = projects[0]?.slug || 'slingshot';

  // Get base URL from current request headers
  const headersList = await headers();
  const baseUrl = await getBaseUrl(headersList);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title="Quick Start"
        description="Get started with Slingshot • Catch, inspect, debug, and replay webhooks"
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
                <li>Real-time webhook streaming via SWR Polling</li>
                <li>Full request inspection (headers, body, IP, timestamp)</li>
                <li>JSON viewing and diffing with Monaco Editor</li>
                <li>One-click cURL export</li>
                <li>Client-side webhook replay (SSRF-safe)</li>
                <li>
                  Supports all HTTP methods (GET, POST, PUT, DELETE, etc.)
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Examples */}
      <HowToUseExamples
        baseUrl={baseUrl}
        projects={projects}
        defaultProject={defaultProject}
      />
    </div>
  );
}
