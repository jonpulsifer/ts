'use client';

import { Copy, FileJson, Send } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Webhook } from '@/lib/types';

// Format time consistently (client-side only to avoid hydration issues)
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes}:${seconds} ${ampm}`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  // Use consistent formatting to avoid hydration issues
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

// Dynamically import Monaco Editor (no SSR)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-muted-foreground">
      Loading editor...
    </div>
  ),
});

import { slingshotDraculaTheme } from '@/lib/monaco-theme';

interface WebhookDetailProps {
  webhook: Webhook | null;
  onResend?: (webhook: Webhook) => void;
}

export function WebhookDetail({ webhook, onResend }: WebhookDetailProps) {
  const [activeTab, setActiveTab] = useState<
    'headers' | 'body' | 'response' | 'raw'
  >('headers');
  const [_copied, setCopied] = useState(false);
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  const formattedBody = useMemo(() => {
    if (!webhook?.body) return null;

    try {
      const parsed = JSON.parse(webhook.body);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return webhook.body;
    }
  }, [webhook?.body]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Update time/date on client side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    if (webhook) {
      setTime(formatTime(webhook.timestamp));
      setDate(formatDate(webhook.timestamp));
    }
  }, [webhook]);

  const handleCopyAsCurl = () => {
    if (!webhook) return;

    const headers = Object.entries(webhook.headers)
      .map(([key, value]) => `  -H '${key}: ${value}'`)
      .join(' \\\n');

    const body = webhook.body
      ? `  -d '${webhook.body.replace(/'/g, "'\\''")}'`
      : '';

    const curl = `curl -X ${webhook.method} '${webhook.url}' \\\n${headers}${body ? ` \\\n${body}` : ''}`;

    handleCopy(curl);
  };

  if (!webhook) {
    return (
      <div className="h-full flex items-center justify-center bg-primary/10">
        <div className="text-center">
          <FileJson className="h-20 w-20 text-primary mx-auto mb-4 drop-shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
          <p className="text-foreground font-semibold text-lg">
            Select a webhook to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border/50 space-y-4 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="text-sm font-semibold border border-border/50 bg-primary/5"
            >
              {webhook.method}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${
                webhook.direction === 'incoming'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
              }`}
            >
              {webhook.direction === 'incoming' ? 'Incoming' : 'Outgoing'}
            </Badge>
            {webhook.direction === 'outgoing' && webhook.responseStatus && (
              <Badge
                variant="outline"
                className={`text-xs font-semibold ${
                  webhook.responseStatus >= 200 && webhook.responseStatus < 300
                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                    : webhook.responseStatus >= 400
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                }`}
              >
                {webhook.responseStatus}
              </Badge>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {mounted ? time : '--:--:-- --'}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {mounted ? date : '--- --, ----'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAsCurl}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy as cURL
            </Button>
            {onResend && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onResend(webhook)}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
                Resend
              </Button>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'headers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('headers')}
          >
            Headers
          </Button>
          <Button
            variant={activeTab === 'body' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('body')}
            disabled={!webhook.body}
          >
            Body
          </Button>
          {webhook.direction === 'outgoing' && webhook.responseBody && (
            <Button
              variant={activeTab === 'response' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('response')}
            >
              Response
            </Button>
          )}
          <Button
            variant={activeTab === 'raw' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('raw')}
          >
            Raw
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'headers' && (
          <ScrollArea className="h-full">
            <div className="p-6 space-y-2">
              {Object.entries(webhook.headers).map(([key, value]) => (
                <div
                  key={key}
                  className="flex gap-4 py-3 px-3 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-all rounded-lg group"
                >
                  <div className="font-mono text-sm font-semibold min-w-[200px] text-foreground group-hover:text-primary transition-colors">
                    {key}
                  </div>
                  <div className="font-mono text-sm text-muted-foreground flex-1 break-all group-hover:text-foreground/80 transition-colors">
                    {value}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0 opacity-0 group-hover:opacity-100 hover:bg-primary/10 transition-all"
                    onClick={() => handleCopy(`${key}: ${value}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {activeTab === 'body' && webhook.body && (
          <MonacoEditor
            height="100%"
            language="json"
            value={formattedBody || webhook.body}
            theme="slingshot-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
              lineHeight: 22,
              padding: { top: 12, bottom: 12 },
              renderLineHighlight: 'gutter',
            }}
            beforeMount={(monaco) => {
              monaco.editor.defineTheme(
                'slingshot-dark',
                slingshotDraculaTheme,
              );
            }}
          />
        )}

        {activeTab === 'response' &&
          webhook.direction === 'outgoing' &&
          webhook.responseBody && (
            <MonacoEditor
              height="100%"
              language="json"
              value={(() => {
                try {
                  return JSON.stringify(
                    JSON.parse(webhook.responseBody),
                    null,
                    2,
                  );
                } catch {
                  return webhook.responseBody;
                }
              })()}
              theme="slingshot-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
                lineHeight: 22,
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: 'gutter',
              }}
              beforeMount={(monaco) => {
                monaco.editor.defineTheme(
                  'slingshot-dark',
                  slingshotDraculaTheme,
                );
              }}
            />
          )}

        {activeTab === 'raw' && (
          <MonacoEditor
            height="100%"
            language="json"
            value={JSON.stringify(webhook, null, 2)}
            theme="slingshot-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
              lineHeight: 22,
              padding: { top: 12, bottom: 12 },
              renderLineHighlight: 'gutter',
            }}
            beforeMount={(monaco) => {
              monaco.editor.defineTheme(
                'slingshot-dark',
                slingshotDraculaTheme,
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
