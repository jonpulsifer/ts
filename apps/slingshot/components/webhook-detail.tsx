'use client';

import { Copy, FileJson, GitCompare, Send } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const codeStyle = {
  ...dracula,
  'pre[class*="language-"]': {
    ...(dracula['pre[class*="language-"]'] as object),
    background: 'transparent',
    margin: 0,
  },
  'code[class*="language-"]': {
    ...(dracula['code[class*="language-"]'] as object),
    background: 'transparent',
    display: 'block',
  },
  'span[class*="token-line"]': {
    display: 'block',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
  },
};

const codeCustomStyle: CSSProperties = {
  background: 'transparent',
  height: '100%',
  margin: 0,
  padding: '16px',
  fontSize: 14,
  lineHeight: '22px',
  borderRadius: 0,
  fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
  overflowX: 'hidden',
};

interface WebhookDetailProps {
  webhook: Webhook | null;
  onResend?: (webhook: Webhook) => void;
  onOpenDiffModal?: () => void;
  activeTabExternal?: 'headers' | 'body' | 'response' | 'raw';
  onActiveTabChange?: (tab: 'headers' | 'body' | 'response' | 'raw') => void;
}

export function WebhookDetail({
  webhook,
  onResend,
  onOpenDiffModal,
  activeTabExternal,
  onActiveTabChange,
}: WebhookDetailProps) {
  if (!webhook) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <FileJson className="h-20 w-20 text-primary mx-auto mb-4 drop-shadow-[0_0_6px_rgba(139,92,246,0.4)]" />
          <p className="text-foreground font-semibold text-lg">
            Select a webhook to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <WebhookDetailContent
      webhook={webhook}
      onResend={onResend}
      onOpenDiffModal={onOpenDiffModal}
      activeTabExternal={activeTabExternal}
      onActiveTabChange={onActiveTabChange}
    />
  );
}

function _WebhookDetailSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border/50 space-y-4 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

function WebhookDetailContent({
  webhook,
  onResend,
  onOpenDiffModal,
  activeTabExternal,
  onActiveTabChange,
}: {
  webhook: Webhook;
  onResend?: (webhook: Webhook) => void;
  onOpenDiffModal?: () => void;
  activeTabExternal?: 'headers' | 'body' | 'response' | 'raw';
  onActiveTabChange?: (tab: 'headers' | 'body' | 'response' | 'raw') => void;
}) {
  const [activeTab, setActiveTab] = useState<
    'headers' | 'body' | 'response' | 'raw'
  >('headers');
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const hasBody = Boolean(webhook.body);
  const hasResponse =
    webhook.direction === 'outgoing' && Boolean(webhook.responseBody);

  useEffect(() => {
    if (activeTabExternal) {
      setActiveTab(activeTabExternal);
    }
  }, [activeTabExternal]);

  const handleCopy = async (text: string, label?: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(label ? `${label} copied` : 'Copied to clipboard');
  };

  const buildCurl = () => {
    const headers = Object.entries(webhook.headers)
      .map(([key, value]) => `  -H '${key}: ${value}'`)
      .join(' \\\n');

    const body = webhook.body
      ? `  -d '${webhook.body.replace(/'/g, "'\\''")}'`
      : '';

    return `curl -X ${webhook.method} '${webhook.url}' \\\n${headers}${body ? ` \\\n${body}` : ''}`;
  };

  const buildHttpie = () => {
    const url = webhook.url;
    const method = webhook.method.toLowerCase();
    const headerPart = Object.entries(webhook.headers)
      .map(([k, v]) => `${k}:'${v.replace(/'/g, "\\'")}'`)
      .join(' ');
    const bodyPart = webhook.body
      ? ` <<< '${webhook.body.replace(/'/g, "\\'")}'`
      : '';
    return `http ${method} '${url}' ${headerPart}${bodyPart ? ` ${bodyPart}` : ''}`.trim();
  };

  const buildBurpRequest = () => {
    try {
      const url = new URL(webhook.url);
      const path = url.pathname + (url.search || '');
      const headers = Object.entries(webhook.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      return `${webhook.method} ${path} HTTP/1.1
Host: ${url.host}
${headers}

${webhook.body || ''}`;
    } catch {
      return null;
    }
  };

  const renderCodeBlock = (value: string, language = 'json') => (
    <ScrollArea className="h-full">
      <SyntaxHighlighter
        language={language}
        style={codeStyle}
        customStyle={codeCustomStyle}
        showLineNumbers
        wrapLongLines={false}
        lineNumberStyle={{ minWidth: '2ch', color: '#6272a4', opacity: 0.8 }}
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-geist-mono), "Courier New", monospace',
          },
        }}
      >
        {value}
      </SyntaxHighlighter>
    </ScrollArea>
  );

  const formattedBody = useMemo(() => {
    if (!webhook?.body) return null;

    try {
      const parsed = JSON.parse(webhook.body);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return webhook.body;
    }
  }, [webhook?.body]);

  // Update time/date on client side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    if (webhook) {
      setTime(formatTime(webhook.timestamp));
      setDate(formatDate(webhook.timestamp));
    }
  }, [webhook]);

  return (
    <div className="h-full flex flex-col overflow-hidden w-full">
      <div className="p-6 border-b border-border/50 space-y-4 bg-muted/20 shrink-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
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
                    webhook.responseStatus >= 200 &&
                    webhook.responseStatus < 300
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
              <div className="hidden sm:flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const cmd = buildHttpie();
                    if (cmd) handleCopy(cmd, 'HTTPie command');
                  }}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy as HTTPie
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="px-2">
                      ▾
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        const cmd = buildCurl();
                        if (cmd) handleCopy(cmd, 'cURL command');
                      }}
                    >
                      Copy as cURL
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const cmd = buildHttpie();
                        if (cmd) handleCopy(cmd, 'HTTPie command');
                      }}
                    >
                      Copy as HTTPie
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const req = buildBurpRequest();
                        if (req) handleCopy(req, 'Burp request');
                      }}
                    >
                      Copy for Burp
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {onOpenDiffModal && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenDiffModal}
                  className="gap-2"
                >
                  <GitCompare className="h-4 w-4" />
                  Compare
                </Button>
              )}
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

          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              const tab = val as typeof activeTab;
              setActiveTab(tab);
              onActiveTabChange?.(tab);
            }}
            className="w-full flex flex-col gap-4"
          >
            <TabsList className="flex w-full justify-start overflow-x-auto gap-1 bg-muted/30 border border-border/60 rounded-md p-1">
              <TabsTrigger
                value="headers"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-foreground data-[state=inactive]:hover:bg-primary/10 data-[state=inactive]:hover:text-primary"
              >
                Headers
              </TabsTrigger>
              <TabsTrigger
                value="body"
                disabled={!hasBody}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-foreground data-[state=inactive]:hover:bg-primary/10 data-[state=inactive]:hover:text-primary data-[disabled]:opacity-60 data-[disabled]:cursor-not-allowed data-[disabled]:bg-muted/40"
              >
                Body
              </TabsTrigger>
              <TabsTrigger
                value="response"
                disabled={!hasResponse}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-foreground data-[state=inactive]:hover:bg-primary/10 data-[state=inactive]:hover:text-primary data-[disabled]:opacity-60 data-[disabled]:cursor-not-allowed data-[disabled]:bg-muted/40"
              >
                Response
              </TabsTrigger>
              <TabsTrigger
                value="raw"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-foreground data-[state=inactive]:hover:bg-primary/10 data-[state=inactive]:hover:text-primary"
              >
                Raw
              </TabsTrigger>
            </TabsList>

            <div className="relative flex-1 min-h-[360px] max-h-[70vh] overflow-auto group/editor pt-2 w-full">
              {(activeTab === 'body' ||
                activeTab === 'response' ||
                activeTab === 'raw') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-1 right-2 z-10 gap-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover/editor:opacity-100 transition-opacity"
                  onClick={() => {
                    let text = '';
                    if (activeTab === 'body' && webhook.body) {
                      text = formattedBody || webhook.body;
                    } else if (
                      activeTab === 'response' &&
                      webhook.responseBody
                    ) {
                      try {
                        text = JSON.stringify(
                          JSON.parse(webhook.responseBody),
                          null,
                          2,
                        );
                      } catch {
                        text = webhook.responseBody;
                      }
                    } else if (activeTab === 'raw') {
                      text = JSON.stringify(webhook, null, 2);
                    }
                    if (text) handleCopy(text, 'Content copied');
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              )}

              <TabsContent
                value="headers"
                className="m-0 h-full overflow-hidden"
              >
                <ScrollArea className="h-full w-full">
                  <div className="p-2 sm:p-4 space-y-2">
                    {Object.entries(webhook.headers).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex gap-4 py-3 px-3 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-all rounded-lg group"
                      >
                        <div className="font-mono text-sm font-semibold min-w-[160px] sm:min-w-[200px] text-foreground group-hover:text-primary transition-colors">
                          {key}
                        </div>
                        <div className="font-mono text-sm text-muted-foreground flex-1 break-all group-hover:text-foreground/80 transition-colors">
                          {value}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0 opacity-0 group-hover:opacity-100 hover:bg-primary/10 transition-all"
                          onClick={() => handleCopy(`${key}: ${value}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="body" className="m-0 h-full overflow-hidden">
                <ScrollArea className="h-full w-full">
                  <div className="min-h-full">
                    {hasBody && renderCodeBlock(formattedBody || webhook.body!)}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="response"
                className="m-0 h-full overflow-hidden"
              >
                <ScrollArea className="h-full w-full">
                  <div className="min-h-full">
                    {hasResponse &&
                      renderCodeBlock(
                        (() => {
                          try {
                            return JSON.stringify(
                              JSON.parse(webhook.responseBody || ''),
                              null,
                              2,
                            );
                          } catch {
                            return webhook.responseBody || '';
                          }
                        })(),
                      )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="raw" className="m-0 h-full overflow-hidden">
                <ScrollArea className="h-full w-full">
                  <div className="min-h-full">
                    {renderCodeBlock(JSON.stringify(webhook, null, 2))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
