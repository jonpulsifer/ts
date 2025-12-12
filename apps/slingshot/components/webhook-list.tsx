'use client';

import { Circle, FileJson, GitCompare, Timer, Trash2 } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Webhook } from '@/lib/types';
import { CopyButton } from './copy-button';

// Client-side component to avoid hydration mismatch
function WebhookLinkCopyButton({
  projectSlug,
  webhookId,
}: {
  projectSlug: string;
  webhookId: string;
}) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(`${window.location.origin}/${projectSlug}?webhook=${webhookId}`);
    }
  }, [projectSlug, webhookId]);

  return (
    <CopyButton
      text={url}
      size="icon"
      variant="outline"
      title="Copy link to webhook"
    />
  );
}

interface WebhookListProps {
  webhooks: Webhook[];
  selectedWebhook: Webhook | null;
  onSelectWebhook: (webhook: Webhook) => void;
  onClearHistory: () => void;
  isConnected: boolean;
  projectSlug: string;
  onCompare?: (webhook: Webhook) => void;
  isLoading?: boolean;
}

const getMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: 'bg-blue-500/15 text-blue-400',
    POST: 'bg-green-500/15 text-green-400',
    PUT: 'bg-yellow-500/15 text-yellow-400',
    PATCH: 'bg-orange-500/15 text-orange-400',
    DELETE: 'bg-red-500/15 text-red-400',
  };
  return colors[method] || 'bg-gray-500/15 text-gray-400';
};

const _getStatusDot = (webhook: Webhook) => {
  if (webhook.direction === 'incoming') return 'bg-blue-400';
  if (webhook.responseStatus === undefined) return 'bg-purple-400';
  if (webhook.responseStatus >= 200 && webhook.responseStatus < 300)
    return 'bg-green-400';
  if (webhook.responseStatus >= 400) return 'bg-red-400';
  return 'bg-amber-400';
};

const WebhookListItem = memo(function WebhookListItem({
  webhook,
  isSelected,
  onSelect,
  onCompare,
  canCompare,
  projectSlug,
  index,
}: {
  webhook: Webhook;
  isSelected: boolean;
  onSelect: (webhook: Webhook) => void;
  onCompare: (webhook: Webhook) => void;
  canCompare: boolean;
  projectSlug: string;
  index: number;
}) {
  const methodColors: Record<string, string> = {
    GET: 'border-l-blue-500',
    POST: 'border-l-green-500',
    PUT: 'border-l-yellow-500',
    PATCH: 'border-l-orange-500',
    DELETE: 'border-l-red-500',
  };
  const leftBorderColor = methodColors[webhook.method] || 'border-l-gray-500';

  return (
    <div
      className={`group relative transition-colors border-b border-border/30 ${
        isSelected
          ? `bg-primary/5 ${leftBorderColor} border-l-2`
          : `hover:bg-muted/20 ${leftBorderColor} border-l-2 border-l-transparent hover:border-l-2`
      }`}
    >
      <div className="w-full p-2 sm:p-3 group">
        <div className="flex items-start justify-between gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={() => onSelect(webhook)}
            className="flex-1 min-w-0 text-left"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] h-5 min-w-6 px-1.5 py-0 flex items-center justify-center border-border/60 text-muted-foreground"
              >
                #{index + 1}
              </Badge>
              <Badge
                className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 ${getMethodColor(webhook.method)}`}
              >
                {webhook.method}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] sm:text-[11px] ${
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
                  className={`text-[10px] sm:text-[11px] font-medium tabular-nums border bg-transparent ${
                    webhook.responseStatus >= 200 &&
                    webhook.responseStatus < 300
                      ? 'text-green-400 border-green-500/30'
                      : webhook.responseStatus >= 400
                        ? 'text-red-400 border-red-500/30'
                        : 'text-yellow-400 border-yellow-500/30'
                  }`}
                >
                  {webhook.responseStatus}
                </Badge>
              )}
              {webhook.duration !== undefined && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium tabular-nums border-border/50 bg-muted/30 text-muted-foreground gap-1 sm:hidden"
                >
                  <Timer className="h-3 w-3" />
                  {webhook.duration}ms
                </Badge>
              )}
              {webhook.body && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <FileJson className="h-3 w-3 opacity-70" />
                  <span className="tabular-nums">
                    {new Blob([webhook.body]).size} B
                  </span>
                </span>
              )}
              {webhook.duration !== undefined && (
                <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Timer className="h-3 w-3 opacity-70" />
                  <span className="tabular-nums">{webhook.duration}ms</span>
                </span>
              )}
              <div className="w-full text-[10px] text-muted-foreground/60 font-mono truncate -mt-0.5">
                {webhook.id}
              </div>
            </div>
          </button>
          <div className="flex items-center gap-1 shrink-0 transition-opacity opacity-70 group-hover:opacity-100">
            <WebhookLinkCopyButton
              projectSlug={projectSlug}
              webhookId={webhook.id}
            />
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                onCompare(webhook);
              }}
              title="Compare with selected webhook"
              disabled={!canCompare}
            >
              <GitCompare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

export function WebhookList({
  webhooks,
  selectedWebhook,
  onSelectWebhook,
  onClearHistory,
  isConnected,
  projectSlug,
  onCompare,
  isLoading = false,
}: WebhookListProps) {
  const selectedId = selectedWebhook?.id;

  const handleCompare = (webhook: Webhook) => {
    if (!onCompare || !selectedWebhook || selectedWebhook.id === webhook.id) {
      return;
    }
    onCompare(webhook);
  };

  return (
    <div className="h-full min-h-[260px] flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-foreground">Webhooks</h2>
          <Badge
            variant="secondary"
            className="text-xs bg-primary/10"
            suppressHydrationWarning
          >
            {webhooks.length}
          </Badge>
          <div className="flex items-center gap-1.5">
            <Circle
              className={`h-2 w-2 ${isConnected ? 'fill-green-400 text-green-400 drop-shadow-[0_0_3px_rgba(74,222,128,0.4)]' : 'fill-gray-500 text-gray-500'}`}
            />
            <span className="text-xs text-muted-foreground font-medium">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearHistory}
            disabled={webhooks.length === 0}
            className="hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-[200px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading webhooks...</p>
          </div>
        ) : webhooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/20">
            <Circle className="h-20 w-20 text-primary mb-4 drop-shadow-[0_0_6px_rgba(139,92,246,0.4)] fill-primary/50" />
            <h3 className="text-xl font-bold mb-2 text-foreground">
              No Webhooks Yet
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Send a request to your webhook endpoint to see it appear here in
              real-time
            </p>
          </div>
        ) : (
          <div className="relative">
            {webhooks.map((webhook, index) => (
              <WebhookListItem
                key={webhook.id}
                webhook={webhook}
                isSelected={selectedWebhook?.id === webhook.id}
                onSelect={onSelectWebhook}
                onCompare={handleCompare}
                canCompare={!!selectedId && selectedId !== webhook.id}
                projectSlug={projectSlug}
                index={index}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
