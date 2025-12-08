'use client';

import * as Diff3 from 'node-diff3';
import { useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Webhook } from '@/lib/types';

interface WebhookDiffInlineProps {
  webhooks: Webhook[];
  baseId: string | null;
  compareId: string | null;
  onBaseChange: (id: string) => void;
  onCompareChange: (id: string | null) => void;
}

function methodBadgeClasses(method: string) {
  const upper = method.toUpperCase();
  if (upper === 'GET') return 'bg-blue-500/15 text-blue-400 border-blue-500/40';
  if (upper === 'POST')
    return 'bg-green-500/15 text-green-400 border-green-500/40';
  if (upper === 'PUT')
    return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40';
  if (upper === 'PATCH')
    return 'bg-orange-500/15 text-orange-400 border-orange-500/40';
  if (upper === 'DELETE') return 'bg-red-500/15 text-red-400 border-red-500/40';
  return 'bg-gray-500/15 text-gray-300 border-gray-500/40';
}

function stringifyWebhook(webhook: Webhook | null) {
  if (!webhook) return '';
  return JSON.stringify(webhook, null, 2);
}

function buildUnifiedDiff(oldValue: string, newValue: string) {
  if (!oldValue || !newValue) return '';

  const oldLines = oldValue.split('\n');
  const newLines = newValue.split('\n');
  const diff: string[] = [];

  const comm = Diff3.diffComm(oldLines, newLines) as Array<
    { common: string[] } | { buffer1: string[]; buffer2: string[] }
  >;

  for (const part of comm) {
    if ('common' in part) {
      for (const line of part.common) {
        diff.push(` ${line}`);
      }
      continue;
    }

    if (part.buffer1) {
      for (const line of part.buffer1) {
        diff.push(`-${line}`);
      }
    }
    if (part.buffer2) {
      for (const line of part.buffer2) {
        diff.push(`+${line}`);
      }
    }
  }

  return diff.join('\n');
}

function getChangedLineSets(oldValue: string, newValue: string) {
  if (!oldValue || !newValue) {
    return { changedOld: new Set<number>(), changedNew: new Set<number>() };
  }

  const oldLines = oldValue.split('\n');
  const newLines = newValue.split('\n');
  const changedOld = new Set<number>();
  const changedNew = new Set<number>();

  const comm = Diff3.diffComm(oldLines, newLines) as Array<
    { common: string[] } | { buffer1: string[]; buffer2: string[] }
  >;

  let oldLineIndex = 0;
  let newLineIndex = 0;

  for (const part of comm) {
    if ('common' in part) {
      // These lines are the same in both, skip them
      oldLineIndex += part.common.length;
      newLineIndex += part.common.length;
      continue;
    }

    // Lines only in old (removed)
    if (part.buffer1) {
      for (let i = 0; i < part.buffer1.length; i++) {
        changedOld.add(oldLineIndex + i);
      }
      oldLineIndex += part.buffer1.length;
    }

    // Lines only in new (added)
    if (part.buffer2) {
      for (let i = 0; i < part.buffer2.length; i++) {
        changedNew.add(newLineIndex + i);
      }
      newLineIndex += part.buffer2.length;
    }
  }

  return { changedOld, changedNew };
}

function DiffLines({ diff }: { diff: string }) {
  const lines = diff.split('\n');

  return (
    <div className="font-mono text-xs md:text-sm leading-6 break-words">
      {lines.map((line, idx) => {
        const type = line.startsWith('+')
          ? 'added'
          : line.startsWith('-')
            ? 'removed'
            : 'context';
        return (
          <div
            key={`${type}-${idx}`}
            className={[
              'whitespace-pre-wrap break-words px-3 py-1 rounded',
              type === 'added' && 'bg-emerald-500/10 text-emerald-200',
              type === 'removed' && 'bg-rose-500/10 text-rose-200',
              type === 'context' && 'text-muted-foreground/90',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {line || ' '}
          </div>
        );
      })}
    </div>
  );
}

function PrettyCode({
  value,
  changedLines,
  variant = 'compare',
}: {
  value: string;
  changedLines?: Set<number>;
  variant?: 'base' | 'compare';
}) {
  const isBase = variant === 'base';
  const highlightColor = isBase
    ? 'rgba(244,63,94,0.35)' // rose - more visible
    : 'rgba(34,197,94,0.35)'; // emerald - more visible

  const diffCodeStyle: Record<string, React.CSSProperties> = {
    ...dracula,
    'pre[class*="language-"]': {
      ...(dracula['pre[class*="language-"]'] as object),
      background: 'hsl(var(--card))',
      margin: 0,
    },
    'code[class*="language-"]': {
      ...(dracula['code[class*="language-"]'] as object),
      background: 'transparent',
      display: 'block',
    },
  };

  return (
    <div className="rounded-lg border border-border/50 bg-card shadow-sm overflow-x-hidden">
      <SyntaxHighlighter
        language="json"
        style={diffCodeStyle}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: 13,
          lineHeight: '20px',
          background: 'transparent',
          overflowX: 'hidden',
        }}
        wrapLines
        wrapLongLines={false}
        showLineNumbers
        lineNumberStyle={{
          color: 'rgba(255,255,255,0.35)',
          minWidth: '3ch',
          paddingRight: '1ch',
        }}
        codeTagProps={{
          style: {},
        }}
        lineProps={(lineNumber) => {
          if (!changedLines || changedLines.size === 0) {
            return {
              style: {
                display: 'block',
              },
            };
          }
          const idx = lineNumber - 1;
          const isChanged = changedLines.has(idx);
          if (isChanged) {
            // Apply background color directly with inline style
            return {
              style: {
                display: 'block',
                backgroundColor: highlightColor,
                width: '100%',
                paddingLeft: '0.5rem',
                marginLeft: '-0.5rem',
                marginRight: '-0.5rem',
                paddingRight: '0.5rem',
                borderRadius: '2px',
              },
            };
          }

          return {
            style: {
              display: 'block',
            },
          };
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

export function WebhookDiffInline({
  webhooks,
  baseId,
  compareId,
  onBaseChange,
  onCompareChange,
}: WebhookDiffInlineProps) {
  const base = useMemo(
    () => webhooks.find((w) => w.id === baseId) || null,
    [webhooks, baseId],
  );
  const compare = useMemo(
    () => webhooks.find((w) => w.id === compareId) || null,
    [webhooks, compareId],
  );

  const oldValue = useMemo(() => stringifyWebhook(base), [base]);
  const newValue = useMemo(() => stringifyWebhook(compare), [compare]);
  const unifiedDiff = useMemo(
    () => buildUnifiedDiff(oldValue, newValue),
    [oldValue, newValue],
  );
  const { changedOld, changedNew } = useMemo(
    () => getChangedLineSets(oldValue, newValue),
    [oldValue, newValue],
  );

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-border/60 bg-card/60 p-3 md:p-4 shadow-sm w-full flex flex-col h-full min-h-0">
      <Tabs
        defaultValue="unified"
        className="flex flex-col gap-2 flex-1 min-h-0"
        activationMode="manual"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] uppercase text-muted-foreground whitespace-nowrap">
                Base
              </span>
              <Select
                value={baseId || ''}
                onValueChange={(val) => onBaseChange(val)}
              >
                <SelectTrigger className="h-9 w-[240px]">
                  <SelectValue placeholder="Select base" />
                </SelectTrigger>
                <SelectContent className="max-h-[260px] min-w-[280px]">
                  {webhooks.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      <div className="grid grid-cols-[auto_auto_auto_1fr] items-center gap-2 text-xs">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 border ${methodBadgeClasses(w.method)}`}
                        >
                          {w.method}
                        </Badge>
                        <span className="text-[10px] uppercase text-muted-foreground">
                          {w.direction === 'incoming' ? 'IN' : 'OUT'}
                        </span>
                        <span className="font-mono text-[10px] text-foreground/80">
                          {w.id.slice(0, 6)}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate text-right">
                          {new Date(w.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] uppercase text-muted-foreground whitespace-nowrap">
                Compare
              </span>
              <Select
                value={compareId || ''}
                onValueChange={(val) => onCompareChange(val)}
              >
                <SelectTrigger className="h-9 w-[240px]">
                  <SelectValue placeholder="Select compare" />
                </SelectTrigger>
                <SelectContent className="max-h-[260px] min-w-[280px]">
                  {webhooks.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      <div className="grid grid-cols-[auto_auto_auto_1fr] items-center gap-2 text-xs">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 border ${methodBadgeClasses(w.method)}`}
                        >
                          {w.method}
                        </Badge>
                        <span className="text-[10px] uppercase text-muted-foreground">
                          {w.direction === 'incoming' ? 'IN' : 'OUT'}
                        </span>
                        <span className="font-mono text-[10px] text-foreground/80">
                          {w.id.slice(0, 6)}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate text-right">
                          {new Date(w.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <TabsList className="shrink-0 flex flex-wrap gap-2">
            <TabsTrigger value="unified">Unified</TabsTrigger>
            <TabsTrigger value="side-by-side">Side by side</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="unified" className="m-0 flex-1 min-h-0">
          {base && compare ? (
            <ScrollArea className="h-full w-full">
              <DiffLines diff={unifiedDiff} />
            </ScrollArea>
          ) : (
            <div className="rounded-lg border border-dashed border-border/40 p-4 text-sm text-muted-foreground">
              Select a base and compare webhook to view the diff.
            </div>
          )}
        </TabsContent>

        <TabsContent value="side-by-side" className="m-0 flex-1 min-h-0">
          {base && compare ? (
            <ScrollArea className="h-full w-full">
              <div className="grid gap-3 md:grid-cols-2 w-full min-w-0 pr-4">
                <div className="space-y-2 min-w-0">
                  <div className="text-xs font-semibold text-rose-200">
                    Base request
                  </div>
                  <PrettyCode
                    value={oldValue}
                    changedLines={changedOld}
                    variant="base"
                  />
                </div>
                <div className="space-y-2 min-w-0">
                  <div className="text-xs font-semibold text-emerald-200">
                    Compare request
                  </div>
                  <PrettyCode
                    value={newValue}
                    changedLines={changedNew}
                    variant="compare"
                  />
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="rounded-lg border border-dashed border-border/40 p-4 text-sm text-muted-foreground">
              Select a base and compare webhook to view the diff.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
