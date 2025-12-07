'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Download, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import useMeasure from 'react-use-measure';
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
  initialEtag?: string | null;
  initialMaxSize?: number;
}

export function WebhookSection({
  projectSlug,
  webhookUrl,
  initialWebhooks,
  initialEtag: _initialEtag,
  initialMaxSize: _initialMaxSize,
}: WebhookSectionProps) {
  const [activeTab, setActiveTab] = useState('incoming');
  const [webhookToResend, setWebhookToResend] = useState<Webhook | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [elementRef, bounds] = useMeasure();
  const [displayUrl, setDisplayUrl] = useState(webhookUrl);

  useEffect(() => {
    // Use current location origin if available
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const apiPath = `/api/${projectSlug}`;
      setDisplayUrl(`${origin}${apiPath}`);
    }
  }, [projectSlug]);

  const handleResend = (webhook: Webhook) => {
    setWebhookToResend(webhook);
    setActiveTab('outgoing');
  };

  const handleWebhookSent = () => {
    // Trigger refresh of webhook list
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Tabs for top section only */}
      <div className="rounded-lg border border-border/50 shadow-md bg-card overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-border/50 px-6 pt-4">
            <TabsList className="grid w-full max-w-md grid-cols-2 relative bg-muted/50 p-1">
              <div
                className="absolute inset-0 bg-background/50 rounded-lg"
                aria-hidden="true"
              />
              {['incoming', 'outgoing'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="relative z-10 gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary-foreground transition-colors hover:text-foreground/80"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary rounded-sm shadow-sm"
                        transition={{
                          type: 'spring',
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {tab === 'incoming' ? (
                        <Download className="h-4 w-4" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <motion.div
            animate={{ height: bounds.height || 'auto' }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div ref={elementRef}>
              <AnimatePresence mode="wait">
                {activeTab === 'incoming' ? (
                  <motion.div
                    key="incoming"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="p-6 space-y-6"
                  >
                    <TabsContent
                      value="incoming"
                      forceMount
                      className="m-0 focus-visible:ring-0 focus-visible:outline-none mt-0"
                    >
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
                            {displayUrl}
                          </code>
                          <CopyButton text={displayUrl} />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                const result = await sendTestWebhookAction(
                                  displayUrl,
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
                    </TabsContent>
                  </motion.div>
                ) : (
                  <motion.div
                    key="outgoing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="p-6"
                  >
                    <TabsContent
                      value="outgoing"
                      forceMount
                      className="m-0 focus-visible:ring-0 focus-visible:outline-none mt-0"
                    >
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
                        webhookUrl={displayUrl}
                        webhookToResend={webhookToResend}
                        onResendComplete={() => setWebhookToResend(null)}
                        onWebhookSent={handleWebhookSent}
                      />
                    </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
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
