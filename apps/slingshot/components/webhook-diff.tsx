'use client';

import { useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Webhook } from '@/lib/types';

interface WebhookDiffProps {
  webhookA: Webhook | null;
  webhookB: Webhook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WebhookDiff({
  webhookA,
  webhookB,
  open,
  onOpenChange,
}: WebhookDiffProps) {
  const oldValue = useMemo(() => {
    if (!webhookA) return '';
    return JSON.stringify(webhookA, null, 2);
  }, [webhookA]);

  const newValue = useMemo(() => {
    if (!webhookB) return '';
    return JSON.stringify(webhookB, null, 2);
  }, [webhookB]);

  // Generate unified diff
  const unifiedDiff = useMemo(() => {
    if (!oldValue || !newValue) return '';

    const oldLines = oldValue.split('\n');
    const newLines = newValue.split('\n');
    const diff: string[] = [];

    // Simple line-by-line diff
    const maxLines = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';

      if (oldLine === newLine) {
        diff.push(` ${oldLine}`);
      } else {
        if (oldLine) {
          diff.push(`-${oldLine}`);
        }
        if (newLine) {
          diff.push(`+${newLine}`);
        }
      }
    }

    return diff.join('\n');
  }, [oldValue, newValue]);

  if (!webhookA || !webhookB) {
    return null;
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Custom style based on vscDarkPlus but with violet accents
  const customStyle = {
    ...vscDarkPlus,
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: '#1e1e2e',
      color: '#f8f8f2',
    },
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: '#1e1e2e',
      color: '#f8f8f2',
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[100vw] max-w-[100vw] max-h-[95vh] flex flex-col p-0"
        style={{ margin: 0, maxWidth: '100vw' }}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Compare Webhooks</DialogTitle>
        </DialogHeader>
        <div
          className="flex-1 flex flex-col min-h-0 px-6 pb-6"
          style={{ minHeight: '600px' }}
        >
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-xs bg-primary/5 border-border/50"
              >
                {webhookA.method}
              </Badge>
              <span className="text-sm text-muted-foreground font-mono">
                {webhookA.id.slice(0, 8)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(webhookA.timestamp)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-xs bg-primary/5 border-border/50"
              >
                {webhookB.method}
              </Badge>
              <span className="text-sm text-muted-foreground font-mono">
                {webhookB.id.slice(0, 8)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(webhookB.timestamp)}
              </span>
            </div>
          </div>

          <Tabs defaultValue="unified" className="flex-1 flex flex-col min-h-0">
            <TabsList className="mb-4">
              <TabsTrigger value="split">Side by Side</TabsTrigger>
              <TabsTrigger value="unified">Unified Diff</TabsTrigger>
            </TabsList>

            <TabsContent value="split" className="flex-1 min-h-0 mt-0">
              <div
                className="grid grid-cols-2 gap-4 h-full"
                style={{ minHeight: '600px' }}
              >
                <div className="flex flex-col border border-border/50 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-muted/20 border-b border-border/50">
                    <span className="text-sm font-semibold text-foreground">
                      Webhook A
                    </span>
                  </div>
                  <ScrollArea className="flex-1">
                    <SyntaxHighlighter
                      language="json"
                      style={customStyle}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        fontSize: '13px',
                        fontFamily:
                          'var(--font-geist-mono), "Courier New", monospace',
                        lineHeight: '20px',
                        background: '#1e1e2e',
                      }}
                      showLineNumbers
                      wrapLines
                    >
                      {oldValue}
                    </SyntaxHighlighter>
                  </ScrollArea>
                </div>
                <div className="flex flex-col border border-border/50 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-muted/20 border-b border-border/50">
                    <span className="text-sm font-semibold text-foreground">
                      Webhook B
                    </span>
                  </div>
                  <ScrollArea className="flex-1">
                    <SyntaxHighlighter
                      language="json"
                      style={customStyle}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        fontSize: '13px',
                        fontFamily:
                          'var(--font-geist-mono), "Courier New", monospace',
                        lineHeight: '20px',
                        background: '#1e1e2e',
                      }}
                      showLineNumbers
                      wrapLines
                    >
                      {newValue}
                    </SyntaxHighlighter>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="unified" className="flex-1 min-h-0 mt-0">
              <div className="h-full flex flex-col border border-border/50 rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-muted/20 border-b border-border/50">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 bg-red-500/20 border border-red-500/50 rounded" />
                      <span className="text-muted-foreground">Removed</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 bg-green-500/20 border border-green-500/50 rounded" />
                      <span className="text-muted-foreground">Added</span>
                    </span>
                  </div>
                </div>
                <ScrollArea className="flex-1" style={{ minHeight: '600px' }}>
                  <SyntaxHighlighter
                    language="diff"
                    style={customStyle}
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      fontSize: '13px',
                      fontFamily:
                        'var(--font-geist-mono), "Courier New", monospace',
                      lineHeight: '20px',
                      background: '#1e1e2e',
                    }}
                    showLineNumbers
                    wrapLines
                    lineProps={(lineNumber) => {
                      const line = unifiedDiff.split('\n')[lineNumber - 1];
                      if (line?.startsWith('-')) {
                        return {
                          style: { background: 'rgba(239, 68, 68, 0.1)' },
                        };
                      }
                      if (line?.startsWith('+')) {
                        return {
                          style: { background: 'rgba(34, 197, 94, 0.1)' },
                        };
                      }
                      return {};
                    }}
                  >
                    {unifiedDiff}
                  </SyntaxHighlighter>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
