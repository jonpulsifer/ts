'use client';

import {
  Cloud,
  Info,
  Laptop,
  Link,
  Loader2,
  Plus,
  Send,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  saveOutgoingWebhookAction,
  sendOutgoingWebhookAction,
} from '@/lib/actions';
import type { Webhook } from '@/lib/types';

interface HeaderPair {
  id: string;
  key: string;
  value: string;
}

interface BodyPair {
  id: string;
  key: string;
  value: string;
}

interface OutgoingWebhookProps {
  projectSlug: string;
  webhookUrl?: string;
  webhookToResend?: Webhook | null;
  onResendComplete?: () => void;
  onWebhookSent?: () => void;
}

export function OutgoingWebhook({
  projectSlug,
  webhookUrl,
  webhookToResend,
  onResendComplete,
  onWebhookSent,
}: OutgoingWebhookProps) {
  const [method, setMethod] = useState('POST');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<HeaderPair[]>([
    { id: 'header-0', key: '', value: '' },
  ]);
  const [bodyPairs, setBodyPairs] = useState<BodyPair[]>([
    { id: 'body-0', key: '', value: '' },
  ]);
  const [headerMode, setHeaderMode] = useState<'pairs' | 'raw'>('pairs');
  const [bodyMode, setBodyMode] = useState<'pairs' | 'raw'>('pairs');
  const [rawHeaders, setRawHeaders] = useState<string>('{}');
  const [rawBody, setRawBody] = useState<string>('{}');
  const [isLoading, setIsLoading] = useState(false);

  const addHeader = () => {
    setHeaders([...headers, { id: Date.now().toString(), key: '', value: '' }]);
  };

  const removeHeader = (id: string) => {
    const filtered = headers.filter((h) => h.id !== id);
    // Always keep at least one empty header row
    setHeaders(
      filtered.length > 0
        ? filtered
        : [{ id: Date.now().toString(), key: '', value: '' }],
    );
  };

  const updateHeader = (id: string, field: 'key' | 'value', value: string) => {
    setHeaders(
      headers.map((h) => (h.id === id ? { ...h, [field]: value } : h)),
    );
  };

  const addBodyPair = () => {
    setBodyPairs([
      ...bodyPairs,
      { id: Date.now().toString(), key: '', value: '' },
    ]);
  };

  const removeBodyPair = (id: string) => {
    const filtered = bodyPairs.filter((b) => b.id !== id);
    // Always keep at least one empty body pair row
    setBodyPairs(
      filtered.length > 0
        ? filtered
        : [{ id: Date.now().toString(), key: '', value: '' }],
    );
  };

  const updateBodyPair = (
    id: string,
    field: 'key' | 'value',
    value: string,
  ) => {
    setBodyPairs(
      bodyPairs.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    );
  };

  const [fetchMode, setFetchMode] = useState<'server' | 'client'>('server');

  const headersRawSchema = z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean()]),
  );
  const headersStringSchema = z.record(z.string(), z.string());
  const bodySchema = z.any();

  const syncHeadersToRaw = () => {
    const obj: Record<string, string> = {};
    headers.forEach(({ key, value }) => {
      if (key.trim()) obj[key.trim()] = value;
    });
    setRawHeaders(JSON.stringify(obj, null, 2));
  };

  const tryConvertHeadersToPairs = () => {
    try {
      const parsed = headersStringSchema.parse(JSON.parse(rawHeaders || '{}'));
      const entries = Object.entries(parsed).filter(([k]) => k.trim().length);
      setHeaders(
        entries.length > 0
          ? entries.map(([key, value], index) => ({
              id: `header-${index}`,
              key,
              value: String(value),
            }))
          : [{ id: 'header-0', key: '', value: '' }],
      );
      return true;
    } catch (error) {
      toast.error(
        'To switch to Fields, headers must be a JSON object of string values',
        {
          description: error instanceof Error ? error.message : undefined,
        },
      );
      return false;
    }
  };

  const syncBodyToRaw = () => {
    const obj: Record<string, any> = {};
    bodyPairs.forEach(({ key, value }) => {
      if (key.trim()) {
        try {
          obj[key.trim()] = JSON.parse(value);
        } catch {
          obj[key.trim()] = value;
        }
      }
    });
    setRawBody(
      Object.keys(obj).length > 0 ? JSON.stringify(obj, null, 2) : '{}',
    );
  };

  const tryConvertBodyToPairs = () => {
    try {
      const parsed = bodySchema.parse(JSON.parse(rawBody || '{}'));
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const entries = Object.entries(parsed as Record<string, any>).filter(
          ([k]) => k.trim().length,
        );
        setBodyPairs(
          entries.length > 0
            ? entries.map(([key, value], index) => ({
                id: `body-${index}`,
                key,
                value: String(value),
              }))
            : [{ id: 'body-0', key: '', value: '' }],
        );
        return true;
      }
      throw new Error('Body must be a JSON object to switch back to fields');
    } catch (error) {
      toast.error('Body must be a JSON object to switch back to fields', {
        description: error instanceof Error ? error.message : undefined,
      });
      return false;
    }
  };

  // Populate form when webhookToResend is provided
  useEffect(() => {
    if (webhookToResend) {
      setMethod(webhookToResend.method);
      setUrl(webhookToResend.url);

      // Convert headers object to array of pairs
      const headerEntries = Object.entries(webhookToResend.headers)
        .filter(
          ([key]) =>
            !['content-type', 'content-length'].includes(key.toLowerCase()),
        )
        .map(([key, value], index) => ({
          id: `header-${index}`,
          key,
          value,
        }));
      setHeaders(
        headerEntries.length > 0
          ? headerEntries
          : [{ id: 'header-0', key: '', value: '' }],
      );

      // Parse body JSON if present
      if (webhookToResend.body) {
        try {
          const parsed = JSON.parse(webhookToResend.body);
          if (
            typeof parsed === 'object' &&
            parsed !== null &&
            !Array.isArray(parsed)
          ) {
            const bodyEntries = Object.entries(parsed).map(
              ([key, value], index) => ({
                id: `body-${index}`,
                key,
                value:
                  typeof value === 'string' ? value : JSON.stringify(value),
              }),
            );
            setBodyPairs(
              bodyEntries.length > 0
                ? bodyEntries
                : [{ id: 'body-0', key: '', value: '' }],
            );
          } else {
            setBodyPairs([
              { id: 'body-0', key: '', value: webhookToResend.body },
            ]);
          }
        } catch {
          setBodyPairs([
            { id: 'body-0', key: '', value: webhookToResend.body },
          ]);
        }
      } else {
        setBodyPairs([{ id: 'body-0', key: '', value: '' }]);
        setRawBody('{}');
      }
      setRawHeaders(JSON.stringify(webhookToResend.headers, null, 2));
    }
  }, [webhookToResend]);

  const handleSend = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setIsLoading(true);
    try {
      // Build headers object (pair or raw)
      let parsedHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (headerMode === 'pairs') {
        headers.forEach(({ key, value }) => {
          if (key.trim() && value.trim()) {
            parsedHeaders[key.trim()] = value.trim();
          }
        });
      } else {
        try {
          const validated = headersRawSchema.parse(
            JSON.parse(rawHeaders || '{}'),
          );
          const normalized: Record<string, string> = {};
          Object.entries(validated).forEach(([k, v]) => {
            if (k.trim()) normalized[k] = String(v);
          });
          parsedHeaders =
            Object.keys(normalized).length > 0 ? normalized : parsedHeaders;
        } catch (error) {
          toast.error('Headers must be valid JSON object', {
            description: error instanceof Error ? error.message : undefined,
          });
          return;
        }
      }

      const options: RequestInit = {
        method,
        headers: parsedHeaders,
      };

      // Build body JSON (pair or raw)
      let bodyString: string | null = null;
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        try {
          let bodyObj: any = null;
          if (bodyMode === 'pairs') {
            const temp: Record<string, any> = {};
            let hasBodyContent = false;

            bodyPairs.forEach(({ key, value }) => {
              if (key.trim()) {
                hasBodyContent = true;
                try {
                  temp[key.trim()] = JSON.parse(value);
                } catch {
                  temp[key.trim()] = value;
                }
              }
            });
            bodyObj = hasBodyContent ? temp : null;
          } else {
            const parsed = bodySchema.parse(JSON.parse(rawBody || '{}'));
            bodyObj = parsed;
          }

          if (bodyObj) {
            bodyString = JSON.stringify(bodyObj);
            options.body = bodyString;
            if (
              !Object.keys(parsedHeaders).some(
                (k) => k.toLowerCase() === 'content-type',
              )
            ) {
              options.headers = {
                ...parsedHeaders,
                'Content-Type': 'application/json',
              };
            }
          }
        } catch (error) {
          toast.error('Body must be valid JSON', {
            description: error instanceof Error ? error.message : undefined,
          });
          return;
        }
      }

      if (fetchMode === 'client') {
        // Client-side fetch
        const response = await fetch(url, options);
        const text = await response.text();

        toast.success(
          `Webhook sent via Client! Status: ${response.status} ${response.statusText}`,
          {
            description: text.slice(0, 100),
          },
        );

        // Try to save to history (fire and forget, best effort)
        try {
          await saveOutgoingWebhookAction(projectSlug, {
            method,
            url,
            headers: parsedHeaders,
            body: bodyString,
            responseStatus: response.status,
            responseBody: text,
          });
        } catch (e) {
          console.error('Failed to save client webhook history:', e);
        }
      } else {
        // Server-side fetch (via Server Action)
        try {
          const result = await sendOutgoingWebhookAction(projectSlug, {
            method,
            url,
            headers: parsedHeaders,
            body: bodyString,
          });

          toast.success(
            `Webhook sent! Status: ${result.status} ${result.statusText}`,
            {
              description: result.responseBody?.slice(0, 100),
            },
          );
        } catch (actionError) {
          // Extract error message from server action error
          let errorMessage = 'Failed to send webhook';
          if (actionError instanceof Error) {
            errorMessage = actionError.message;
          } else if (typeof actionError === 'string') {
            errorMessage = actionError;
          } else if (
            actionError &&
            typeof actionError === 'object' &&
            'message' in actionError
          ) {
            errorMessage = String(actionError.message);
          }

          toast.error(errorMessage);
          return; // Exit early on error
        }
      }

      // Clear the resend webhook after successful send
      if (onResendComplete) {
        onResendComplete();
      }

      // Notify parent that a webhook was sent
      if (onWebhookSent) {
        onWebhookSent();
      }
    } catch (error) {
      // Fallback error handling for any other errors
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Failed to send webhook';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Label>Fetch Mode</Label>
        <Tabs
          value={fetchMode}
          onValueChange={(v) => setFetchMode(v as 'server' | 'client')}
          className="w-fit"
        >
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="server" className="text-xs gap-2">
              <Cloud className="h-3 w-3" />
              Server
            </TabsTrigger>
            <TabsTrigger value="client" className="text-xs gap-2">
              <Laptop className="h-3 w-3" />
              Client
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="method">HTTP Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger id="method" className="font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">Target URL</Label>
          <div className="flex gap-2">
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono"
            />
            {webhookUrl && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setUrl(webhookUrl)}
                className="shrink-0"
                title="Use project endpoint"
              >
                <Link className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>Headers (optional)</Label>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Use Raw JSON to send non-string header values (bools/ints).
                    To switch back to Fields, the JSON must be an object with
                    string values.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Tabs
            value={headerMode}
            onValueChange={(value) => {
              if (value === 'raw') {
                syncHeadersToRaw();
                setHeaderMode('raw');
              } else {
                const ok = tryConvertHeadersToPairs();
                if (ok) setHeaderMode('pairs');
              }
            }}
            className="h-8"
          >
            <TabsList className="grid grid-cols-2 h-8">
              <TabsTrigger value="pairs" className="text-xs">
                Fields
              </TabsTrigger>
              <TabsTrigger value="raw" className="text-xs">
                Raw JSON
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {headerMode === 'pairs' ? (
          <div className="space-y-2">
            {headers.map((header) => (
              <div key={header.id} className="flex gap-2">
                <Input
                  placeholder="Header name"
                  value={header.key}
                  onChange={(e) =>
                    updateHeader(header.id, 'key', e.target.value)
                  }
                  className="font-mono"
                />
                <Input
                  placeholder="Header value"
                  value={header.value}
                  onChange={(e) =>
                    updateHeader(header.id, 'value', e.target.value)
                  }
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeHeader(header.id)}
                  className="shrink-0"
                  disabled={headers.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addHeader}
              className="h-7 gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Header
            </Button>
          </div>
        ) : (
          <Textarea
            value={rawHeaders}
            onChange={(e) => setRawHeaders(e.target.value)}
            className="font-mono min-h-[140px]"
            placeholder='{"Authorization":"Bearer token"}'
          />
        )}
      </div>

      {['POST', 'PUT', 'PATCH'].includes(method) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>Body JSON (optional)</Label>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Fields mode builds a JSON object from string pairs. Use
                      Raw JSON to send any valid JSON (including
                      numbers/booleans/arrays). To switch back to Fields, the
                      JSON must be an object; values will be stringified.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Tabs
              value={bodyMode}
              onValueChange={(value) => {
                if (value === 'raw') {
                  syncBodyToRaw();
                  setBodyMode('raw');
                } else {
                  const ok = tryConvertBodyToPairs();
                  if (ok) setBodyMode('pairs');
                }
              }}
              className="h-8"
            >
              <TabsList className="grid grid-cols-2 h-8">
                <TabsTrigger value="pairs" className="text-xs">
                  Fields
                </TabsTrigger>
                <TabsTrigger value="raw" className="text-xs">
                  Raw JSON
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {bodyMode === 'pairs' ? (
            <div className="space-y-2">
              {bodyPairs.map((pair) => (
                <div key={pair.id} className="flex gap-2">
                  <Input
                    placeholder="Key"
                    value={pair.key}
                    onChange={(e) =>
                      updateBodyPair(pair.id, 'key', e.target.value)
                    }
                    className="font-mono"
                  />
                  <Input
                    placeholder="Value (JSON or string)"
                    value={pair.value}
                    onChange={(e) =>
                      updateBodyPair(pair.id, 'value', e.target.value)
                    }
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeBodyPair(pair.id)}
                    className="shrink-0"
                    disabled={bodyPairs.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBodyPair}
                className="h-7 gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Field
              </Button>
            </div>
          ) : (
            <Textarea
              value={rawBody}
              onChange={(e) => setRawBody(e.target.value)}
              className="font-mono min-h-[180px]"
              placeholder='{"hello":"world"}'
            />
          )}
        </div>
      )}

      <Button
        onClick={handleSend}
        disabled={isLoading || !url.trim()}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send Webhook
          </>
        )}
      </Button>
    </div>
  );
}
