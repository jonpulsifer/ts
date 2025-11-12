'use client';

import { format } from 'date-fns';
import { Check, Copy, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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
    } catch (error) {
      console.error('Failed to clear webhooks:', error);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-blue-500',
      POST: 'bg-green-500',
      PUT: 'bg-yellow-500',
      PATCH: 'bg-orange-500',
      DELETE: 'bg-red-500',
      HEAD: 'bg-purple-500',
      OPTIONS: 'bg-gray-500',
    };
    return colors[method] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Webhook Testing</CardTitle>
              <CardDescription>
                Send webhooks to the endpoint below to see them appear here
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchWebhooks}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleClear}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm font-medium">Webhook Endpoint:</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted p-2 rounded-md text-sm font-mono break-all">
                {webhookUrl || '/api/anything'}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(webhookUrl || '/api/anything', 'url')
                }
              >
                {copiedId === 'url' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              This endpoint accepts all HTTP methods (GET, POST, PUT, DELETE,
              etc.) and returns request information similar to httpbin/anything
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Incoming Webhooks ({webhooks.length})</CardTitle>
          <CardDescription>
            {webhooks.length === 0
              ? 'No webhooks received yet. Send a request to the endpoint above.'
              : 'Click on a webhook to view details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No webhooks received yet
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {webhooks.map((webhook) => (
                <AccordionItem key={webhook.id} value={webhook.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <Badge
                        className={`${getMethodColor(webhook.method)} text-white`}
                      >
                        {webhook.method}
                      </Badge>
                      <span className="text-sm font-mono flex-1 truncate">
                        {webhook.url}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(webhook.timestamp, 'HH:mm:ss')}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-muted-foreground">
                            Timestamp
                          </div>
                          <div className="font-mono">
                            {format(webhook.timestamp, 'PPpp')}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">
                            IP Address
                          </div>
                          <div className="font-mono">{webhook.ip || 'N/A'}</div>
                        </div>
                      </div>

                      {Object.keys(webhook.query).length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            Query Parameters:
                          </div>
                          <pre className="bg-muted p-3 rounded-md text-sm overflow-auto">
                            {JSON.stringify(webhook.query, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Headers:</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                JSON.stringify(webhook.headers, null, 2),
                                `headers-${webhook.id}`,
                              )
                            }
                          >
                            {copiedId === `headers-${webhook.id}` ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <pre className="bg-muted p-3 rounded-md text-sm overflow-auto max-h-64">
                          {JSON.stringify(webhook.headers, null, 2)}
                        </pre>
                      </div>

                      {webhook.body !== null && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Body:</div>
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
                            >
                              {copiedId === `body-${webhook.id}` ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <pre className="bg-muted p-3 rounded-md text-sm overflow-auto max-h-96 whitespace-pre-wrap break-all">
                            {typeof webhook.body === 'string'
                              ? webhook.body
                              : JSON.stringify(webhook.body, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">
                            Full Request:
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
                          >
                            {copiedId === `full-${webhook.id}` ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <pre className="bg-muted p-3 rounded-md text-sm overflow-auto max-h-96">
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
