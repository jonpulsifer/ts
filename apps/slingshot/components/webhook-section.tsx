'use client';

import { Download, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sendTestWebhookAction } from '@/lib/actions';
import type { Webhook } from '@/lib/types';
import { CopyButton } from './copy-button';
import { OutgoingWebhook } from './outgoing-webhook';
import { WebhookViewer } from './webhook-viewer';

interface WebhookSectionProps {
  projectSlug: string;
  webhookUrl: string;
  initialWebhooks: Webhook[];
}

export function WebhookSection({
  projectSlug,
  webhookUrl,
  initialWebhooks,
}: WebhookSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('incoming');
  const [webhookToResend, setWebhookToResend] = useState<Webhook | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleResend = (webhook: Webhook) => {
    setWebhookToResend(webhook);
    setActiveTab('outgoing');
  };

  const handleWebhookSent = () => {
    // Trigger refresh of webhook list
    setRefreshKey((prev) => prev + 1);
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-border/50 shadow-md bg-card overflow-hidden">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Incoming Webhook Endpoint
              </h2>
              <p className="text-sm text-muted-foreground">
                Send requests to this endpoint to capture webhook data
              </p>
            </div>
          </div>
        </div>
        <WebhookViewer
          projectSlug={projectSlug}
          initialWebhooks={initialWebhooks}
          onResend={handleResend}
          refreshTrigger={refreshKey}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs for top section only */}
      <div className="rounded-lg border border-border/50 shadow-md bg-card overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-border/50 px-6 pt-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="incoming" className="gap-2">
                <Download className="h-4 w-4" />
                Incoming
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="gap-2">
                <Send className="h-4 w-4" />
                Outgoing
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="incoming" className="m-0">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Incoming Webhook Endpoint
                </h2>
                <p className="text-sm text-muted-foreground">
                  Send requests to this endpoint to capture webhook data
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">
                  Endpoint URL
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted/50 p-4 rounded-lg text-sm font-mono break-all border border-border/50">
                    {webhookUrl}
                  </code>
                  <CopyButton text={webhookUrl} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const result = await sendTestWebhookAction(
                          webhookUrl,
                          'GET',
                        );
                        toast.success(
                          `Test webhook sent! Status: ${result.status}`,
                        );
                        // Trigger refresh
                        setRefreshKey((prev) => prev + 1);
                      } catch (error) {
                        toast.error(
                          `Failed to send test webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        );
                      }
                    }}
                    className="h-10 w-10 shrink-0"
                    title="Send GET request"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs bg-primary/5 border-border/50"
                  >
                    All Methods
                  </Badge>
                  <span>
                    Accepts GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="outgoing" className="m-0">
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Send Outgoing Webhook
                </h2>
                <p className="text-sm text-muted-foreground">
                  Send webhooks to external endpoints for testing
                </p>
              </div>
              <OutgoingWebhook
                projectSlug={projectSlug}
                webhookUrl={webhookUrl}
                webhookToResend={webhookToResend}
                onResendComplete={() => setWebhookToResend(null)}
                onWebhookSent={handleWebhookSent}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Webhook list always visible below */}
      <div className="flex-1 min-h-0">
        <WebhookViewer
          projectSlug={projectSlug}
          initialWebhooks={initialWebhooks}
          onResend={handleResend}
          refreshTrigger={refreshKey}
        />
      </div>
    </div>
  );
}
