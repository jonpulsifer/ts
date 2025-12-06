'use client';

import { Check, ExternalLink, Loader2, Plus, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { CodeBlock } from '@/components/code-block';
import { CreateProjectModal } from '@/components/create-project-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sendTestWebhookAction } from '@/lib/actions';

interface HowToUseExamplesProps {
  baseUrl: string;
  projects: Array<{ slug: string }>;
  defaultProject: string;
}

export function HowToUseExamples({
  baseUrl,
  projects,
  defaultProject,
}: HowToUseExamplesProps) {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(defaultProject);
  const [method, setMethod] = useState<'GET' | 'POST'>('POST');
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const endpointUrl = `${baseUrl}/api/${selectedProject}`;

  const httpieExample =
    method === 'POST'
      ? `http post ${endpointUrl} \\
  X-Test:true count:=3 message='hello world'`
      : `http get ${endpointUrl} \\
  X-Test:true`;

  const curlExample =
    method === 'POST'
      ? `curl -X POST ${endpointUrl} \\
  -H 'Content-Type: application/json' \\
  -d '{"message":"hello world","count":3,"flag":true}'`
      : `curl -X GET ${endpointUrl} \\
  -H 'X-Test: true'`;

  const handleSend = async () => {
    setIsSending(true);
    setLastSent(false);

    try {
      const body =
        method === 'POST'
          ? JSON.stringify({ message: 'hello world', count: 3, flag: true })
          : undefined;

      const result = await sendTestWebhookAction(endpointUrl, method, body);

      toast.success('Webhook sent successfully!', {
        description: `Status: ${result.status} ${result.statusText}`,
        duration: 3000,
      });

      setLastSent(true);
      setTimeout(() => setLastSent(false), 2000);
    } catch (error) {
      toast.error('Failed to send webhook', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Try it now Card */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-lg">
        <CardContent className="pt-6 pb-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Send className="h-6 w-6 text-primary" />
                Try it now!
              </h3>
              <p className="text-sm text-muted-foreground">
                Send a test webhook to see it appear in your project in
                real-time
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Label
                  htmlFor="project-select"
                  className="text-sm font-medium text-foreground"
                >
                  Project:
                </Label>
                <Select
                  value={selectedProject}
                  onValueChange={setSelectedProject}
                >
                  <SelectTrigger id="project-select" className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.slug} value={project.slug}>
                        {project.slug}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={method}
                  onValueChange={(v) => setMethod(v as 'GET' | 'POST')}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 text-sm text-muted-foreground min-w-0">
                <span className="font-medium">Endpoint: </span>
                <code className="bg-muted/80 px-2 py-1 rounded font-mono text-xs break-all border border-border/50">
                  {endpointUrl}
                </code>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <Button
                onClick={handleSend}
                disabled={isSending}
                className="gap-2"
                size="lg"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : lastSent ? (
                  <>
                    <Check className="h-4 w-4" />
                    Sent!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Test Webhook
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => router.push(`/${selectedProject}`)}
              >
                <ExternalLink className="h-4 w-4" />
                View Project
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create Webhook Project
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <CodeBlock label="Send with HTTPie" code={httpieExample} />
        <CodeBlock label="Send with cURL" code={curlExample} />
      </div>

      <CreateProjectModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}
