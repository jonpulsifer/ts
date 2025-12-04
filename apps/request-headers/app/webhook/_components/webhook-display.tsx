'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { Check, Copy, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { WebhookRequest } from '@/lib/webhook-store';

export default function WebhookDisplay() {
  const [webhooks, setWebhooks] = useState<WebhookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');

  const fetchWebhooks = async () => {
    try {
      const res = await fetch('/api/webhooks');
      const data = await res.json();
      // Convert timestamp strings back to Date objects
      const webhooksWithDates = data.map((wh: any) => ({
        ...wh,
        timestamp: new Date(wh.timestamp),
      }));
      setWebhooks(webhooksWithDates);
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set webhook URL on client side only
    setWebhookUrl(`${window.location.origin}/api/anything`);
    fetchWebhooks();
    // Poll every 2 seconds for new webhooks
    const interval = setInterval(fetchWebhooks, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = async () => {
    try {
      await fetch('/api/webhooks', { method: 'DELETE' });
      setWebhooks([]);
      toast.success('All webhooks cleared');
    } catch (error) {
      console.error('Failed to clear webhooks:', error);
      toast.error('Failed to clear webhooks');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const _getMethodBadgeVariant = (
    method: string,
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      GET: 'default',
      POST: 'secondary',
      PUT: 'outline',
      PATCH: 'outline',
      DELETE: 'destructive',
      HEAD: 'secondary',
      OPTIONS: 'secondary',
    };
    return variants[method] || 'outline';
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      POST: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      PUT: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
      PATCH:
        'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
      DELETE: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
      HEAD: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
      OPTIONS:
        'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
    };
    return (
      colors[method] ||
      'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
    );
  };

  return (
    <div className="space-y-6">
      <Card className="w-full border-2 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Webhook Endpoint</CardTitle>
              <CardDescription className="mt-1">
                Send requests to this endpoint to capture webhook data
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchWebhooks}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              {webhooks.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-semibold">Endpoint URL</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gradient-to-r from-muted to-muted/50 p-3 rounded-lg text-sm font-mono break-all border">
                {webhookUrl || '/api/anything'}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(webhookUrl || '/api/anything', 'url')
                }
                className="shrink-0"
              >
                {copiedId === 'url' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(webhookUrl || '/api/anything', '_blank')
                }
                className="shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                All Methods
              </Badge>
              <span>Accepts GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full border-2 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                Incoming Webhooks
                <Badge variant="secondary" className="ml-3">
                  {webhooks.length}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                {webhooks.length === 0
                  ? 'No webhooks received yet. Send a request to the endpoint above.'
                  : 'Click on a webhook to view full details'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <RefreshCw className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Webhooks Yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Send a request to the endpoint above to see it appear here in
                real-time
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {webhooks.map((webhook) => (
                <AccordionItem
                  key={webhook.id}
                  value={webhook.id}
                  className="border rounded-lg mb-2 px-4 hover:bg-muted/50 transition-colors"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <Badge
                        className={`${getMethodColor(webhook.method)} border font-semibold`}
                      >
                        {webhook.method}
                      </Badge>
                      <span className="text-sm font-mono flex-1 truncate">
                        {webhook.url}
                      </span>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-medium">
                          {format(webhook.timestamp, 'HH:mm:ss')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(webhook.timestamp, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Timestamp
                          </div>
                          <div className="font-mono text-sm bg-muted/50 p-2 rounded border">
                            {format(webhook.timestamp, 'PPpp')}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            IP Address
                          </div>
                          <div className="font-mono text-sm bg-muted/50 p-2 rounded border">
                            {webhook.ip || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <Separator />

                      {Object.keys(webhook.query).length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold">
                              Query Parameters
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  JSON.stringify(webhook.query, null, 2),
                                  `query-${webhook.id}`,
                                )
                              }
                              className="h-8 w-8 p-0"
                            >
                              {copiedId === `query-${webhook.id}` ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-auto border font-mono">
                            {JSON.stringify(webhook.query, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold">Headers</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                JSON.stringify(webhook.headers, null, 2),
                                `headers-${webhook.id}`,
                              )
                            }
                            className="h-8 w-8 p-0"
                          >
                            {copiedId === `headers-${webhook.id}` ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-auto max-h-64 border font-mono">
                          {JSON.stringify(webhook.headers, null, 2)}
                        </pre>
                      </div>

                      {webhook.body !== null && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold">Body</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  typeof webhook.body === 'string'
                                    ? webhook.body
                                    : JSON.stringify(webhook.body, null, 2),
                                  `body-${webhook.id}`,
                                )
                              }
                              className="h-8 w-8 p-0"
                            >
                              {copiedId === `body-${webhook.id}` ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap break-all border font-mono">
                            {typeof webhook.body === 'string'
                              ? webhook.body
                              : JSON.stringify(webhook.body, null, 2)}
                          </pre>
                        </div>
                      )}

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold">
                            Full Request JSON
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                JSON.stringify(webhook, null, 2),
                                `full-${webhook.id}`,
                              )
                            }
                            className="h-8 w-8 p-0"
                          >
                            {copiedId === `full-${webhook.id}` ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-auto max-h-96 border font-mono">
                          {JSON.stringify(webhook, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
