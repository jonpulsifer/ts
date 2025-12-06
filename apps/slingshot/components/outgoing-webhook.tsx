'use client';

import { Link, Loader2, Plus, Send, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { saveOutgoingWebhookAction } from '@/lib/actions';
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
      }
    }
  }, [webhookToResend]);

  const handleSend = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setIsLoading(true);
    try {
      // Build headers object from form fields
      const parsedHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      headers.forEach(({ key, value }) => {
        if (key.trim() && value.trim()) {
          parsedHeaders[key.trim()] = value.trim();
        }
      });

      const options: RequestInit = {
        method,
        headers: parsedHeaders,
      };

      // Build body JSON from form fields
      let bodyString: string | null = null;
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const bodyObj: Record<string, any> = {};
        let hasBodyContent = false;

        bodyPairs.forEach(({ key, value }) => {
          if (key.trim()) {
            hasBodyContent = true;
            // Try to parse value as JSON, otherwise use as string
            try {
              bodyObj[key.trim()] = JSON.parse(value);
            } catch {
              bodyObj[key.trim()] = value;
            }
          }
        });

        if (hasBodyContent) {
          bodyString = JSON.stringify(bodyObj);
          options.body = bodyString;
        }
      }

      const response = await fetch(url, options);
      const responseText = await response.text();

      // Save the outgoing webhook
      try {
        await saveOutgoingWebhookAction(projectSlug, {
          method,
          url,
          headers: parsedHeaders,
          body: bodyString,
          responseStatus: response.status,
          responseBody: responseText.slice(0, 10000), // Limit response body size
        });
      } catch (error) {
        console.error('Failed to save outgoing webhook:', error);
        // Don't fail the whole operation if saving fails
      }

      toast.success(
        `Webhook sent! Status: ${response.status} ${response.statusText}`,
        {
          description: responseText.slice(0, 100),
        },
      );

      // Clear the resend webhook after successful send
      if (onResendComplete) {
        onResendComplete();
      }

      // Notify parent that a webhook was sent
      if (onWebhookSent) {
        onWebhookSent();
      }
    } catch (error) {
      toast.error(
        `Failed to send webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Headers (optional)</Label>
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
        <div className="space-y-2">
          {headers.map((header) => (
            <div key={header.id} className="flex gap-2">
              <Input
                placeholder="Header name"
                value={header.key}
                onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
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
        </div>
      </div>

      {['POST', 'PUT', 'PATCH'].includes(method) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Body JSON (optional)</Label>
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
          </div>
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
