import { Activity, ArrowRight, Code, Webhook } from 'lucide-react';
import Link from 'next/link';

import { CopyExampleUrlButton } from '@/components/copy-example-url-button';
import { CreateProjectForm } from '@/components/create-project-form';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BASE_URL } from '@/lib/base-url';
import { ensureDefaultProject, getAllProjects } from '@/lib/projects-storage';
import { getGlobalStats, getProjectStats } from '@/lib/stats-storage';

export default async function Home() {
  // Ensure default project exists
  await ensureDefaultProject();
  const projects = await getAllProjects();
  const globalStats = await getGlobalStats();

  // Get stats for each project (with fallback to sync from actual data)
  // Get stats for each project
  const projectStats = await Promise.all(
    projects.map(async (project) => {
      const stats = await getProjectStats(project.slug);

      return {
        ...project,
        webhookCount: stats?.webhookCount || 0,
        lastWebhook: stats?.lastWebhookTimestamp || null,
      };
    }),
  );

  // Use persisted global stats, but ensure it's up to date
  const totalWebhooks =
    globalStats.totalWebhooks ||
    projectStats.reduce((sum, p) => sum + p.webhookCount, 0);
  // Show all projects (slingshot is already pinned to top, rest sorted alphabetically)
  const allProjects = projectStats;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title="Slingshot"
        description="A webhook testing platform • Catch, inspect, debug, and replay webhooks"
      />

      {/* What is Slingshot Section */}
      <Card className="border border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
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
                <li>Real-time webhook streaming via Server-Sent Events</li>
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
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-start gap-2">
              <div className="text-sm font-semibold text-foreground mt-0.5">
                Example webhook URL:
              </div>
              <code className="flex-1 bg-muted/50 px-3 py-1.5 rounded text-sm font-mono border border-border/50">
                {BASE_URL}/api/my-project
              </code>
              <CopyExampleUrlButton url={`${BASE_URL}/api/my-project`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* First Column: Create Project + Projects (2/3 width on large, full width on small) */}
        <div className="lg:col-span-2 space-y-6 order-1 lg:order-1">
          {/* Create Project Form */}
          <Card className="border border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Create Webhook Project
              </CardTitle>
              <CardDescription className="text-xs">
                Create a new project to receive webhooks at a unique endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateProjectForm />
            </CardContent>
          </Card>

          {/* Projects List */}
          <Card className="border border-border/50 bg-card">
            <CardHeader>
              <CardTitle>Webhook Projects</CardTitle>
              <CardDescription>
                All your webhook testing projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allProjects.length === 0 ? (
                <div className="text-center py-8 bg-primary/10 rounded-lg">
                  <Webhook className="h-16 w-16 text-primary mx-auto mb-3" />
                  <p className="font-semibold text-foreground mb-1">
                    No projects yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Create your first webhook project to start receiving and
                    testing webhooks
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allProjects.map((project) => (
                    <Link
                      key={project.slug}
                      href={`/${project.slug}`}
                      className="block p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground truncate">
                              {project.slug}
                            </span>
                            {project.slug === 'slingshot' && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{project.webhookCount} webhooks</span>
                            {project.lastWebhook && (
                              <span>
                                Last:{' '}
                                {new Date(
                                  project.lastWebhook,
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Second Column: Stats (1/3 width on large, bottom on small) */}
        <div className="space-y-3 order-3 lg:order-2">
          {/* Small screen: compact grid */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-3">
            <Card className="border border-border/50 bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 lg:p-6">
                <CardTitle className="text-xs font-medium lg:text-sm">
                  Webhook Projects
                </CardTitle>
                <Webhook className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
                <div className="text-xl font-bold lg:text-2xl">
                  {globalStats.totalProjects || projects.length}
                </div>
                <p className="text-[10px] lg:text-xs text-muted-foreground">
                  Active webhook endpoints
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 lg:p-6">
                <CardTitle className="text-xs font-medium lg:text-sm">
                  Total Webhooks
                </CardTitle>
                <Activity className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
                <div className="text-xl font-bold lg:text-2xl">
                  {totalWebhooks}
                </div>
                <p className="text-[10px] lg:text-xs text-muted-foreground">
                  Received
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
