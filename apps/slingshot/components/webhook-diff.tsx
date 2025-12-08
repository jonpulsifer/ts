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
  const oldLines = oldValue.split('\n');
  const newLines = newValue.split('\n');
  const changedOld = new Set<number>();
  const changedNew = new Set<number>();

  const comm = Diff3.diffComm(oldLines, newLines) as Array<
    { common: string[] } | { buffer1: string[]; buffer2: string[] }
  >;

  let oldIndex = 0;
  let newIndex = 0;
  for (const part of comm) {
    if ('common' in part) {
      oldIndex += part.common.length;
      newIndex += part.common.length;
      continue;
    }
    if (part.buffer1) {
      for (let i = 0; i < part.buffer1.length; i++) {
        changedOld.add(oldIndex + i);
      }
      oldIndex += part.buffer1.length;
    }
    if (part.buffer2) {
      for (let i = 0; i < part.buffer2.length; i++) {
        changedNew.add(newIndex + i);
      }
      newIndex += part.buffer2.length;
    }
  }

  return { changedOld, changedNew };
}

function DiffLines({ diff }: { diff: string }) {
  const lines = diff.split('\n');

  return (
    <div className="font-mono text-xs md:text-sm leading-6">
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
              'whitespace-pre-wrap px-3 py-1 rounded',
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
}: {
  value: string;
  changedLines?: Set<number>;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 shadow-sm">
      <SyntaxHighlighter
        language="json"
        style={dracula}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: 13,
          lineHeight: '20px',
          background: 'hsl(var(--card))',
        }}
        wrapLines
        showLineNumbers
        lineNumberStyle={{ color: 'rgba(255,255,255,0.35)', minWidth: '2ch' }}
        lineProps={(lineNumber) => {
          if (!changedLines) return { style: { display: 'block' } };
          const idx = lineNumber - 1;
          const isChanged = changedLines.has(idx);
          return {
            style: {
              display: 'block',
              background: isChanged ? 'rgba(34,197,94,0.12)' : undefined,
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
    <div className="mt-3 space-y-3 rounded-lg border border-border/60 bg-card/60 p-3 md:p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold text-foreground">
          Request & Response Diff
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase text-muted-foreground">
              Base
            </span>
            <Select
              value={baseId || ''}
              onValueChange={(val) => onBaseChange(val)}
            >
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue placeholder="Select base" />
              </SelectTrigger>
              <SelectContent className="max-h-[260px]">
                {webhooks.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 bg-primary/5 border-border/40"
                      >
                        {w.method}
                      </Badge>
                      <span className="text-[10px] uppercase text-muted-foreground">
                        {w.direction === 'incoming' ? 'IN' : 'OUT'}
                      </span>
                      <span className="font-mono text-[10px] text-foreground/80">
                        {w.id.slice(0, 6)}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {new Date(w.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase text-muted-foreground">
              Compare
            </span>
            <Select
              value={compareId || ''}
              onValueChange={(val) => onCompareChange(val)}
            >
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue placeholder="Select compare" />
              </SelectTrigger>
              <SelectContent className="max-h-[260px]">
                {webhooks.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 bg-primary/5 border-border/40"
                      >
                        {w.method}
                      </Badge>
                      <span className="text-[10px] uppercase text-muted-foreground">
                        {w.direction === 'incoming' ? 'IN' : 'OUT'}
                      </span>
                      <span className="font-mono text-[10px] text-foreground/80">
                        {w.id.slice(0, 6)}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {new Date(w.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="unified"
        className="flex flex-col gap-2"
        activationMode="manual"
      >
        <TabsList className="w-full justify-start">
          <TabsTrigger value="unified">Unified</TabsTrigger>
          <TabsTrigger value="side-by-side">Side by side</TabsTrigger>
        </TabsList>

        <TabsContent value="unified" className="m-0">
          {base && compare ? (
            <ScrollArea className="max-h-[480px] md:max-h-[640px]">
              <DiffLines diff={unifiedDiff} />
            </ScrollArea>
          ) : (
            <div className="rounded-lg border border-dashed border-border/40 p-4 text-sm text-muted-foreground">
              Select a base and compare webhook to view the diff.
            </div>
          )}
        </TabsContent>

        <TabsContent value="side-by-side" className="m-0">
          {base && compare ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">
                  Base request
                </div>
                <PrettyCode value={oldValue} changedLines={changedOld} />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">
                  Compare request
                </div>
                <PrettyCode value={newValue} changedLines={changedNew} />
              </div>
            </div>
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
