'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  Circle,
  Clock,
  FileJson,
  GitCompare,
  Hash,
  Layers,
  Timer,
  Trash2,
} from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Webhook } from '@/lib/types';
import { CopyButton } from './copy-button';
import { WebhookDiff } from './webhook-diff';

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

interface WebhookListProps {
  webhooks: Webhook[];
  selectedWebhook: Webhook | null;
  onSelectWebhook: (webhook: Webhook) => void;
  onClearHistory: () => void;
  isConnected: boolean;
  projectSlug: string;
}

// Client-side only component for relative time to avoid hydration issues
function RelativeTime({ timestamp }: { timestamp: number }) {
  // Use formatted time string directly to avoid client-side ticks for list performance
  const relativeTime = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  
  return (
    <span className="text-sm font-medium text-foreground">{relativeTime}</span>
  );
}

// Client-side only time display to avoid hydration issues
function TimeDisplay({ timestamp }: { timestamp: number }) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    setMounted(true);
    setTime(formatTime(timestamp));
  }, [timestamp]);

  if (!mounted) {
    return <span className="font-mono opacity-70">--:--:-- --</span>;
  }

  return <span className="font-mono opacity-70">{time}</span>;
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

const WebhookListItem = memo(function WebhookListItem({
  webhook,
  isSelected,
  onSelect,
  onCompare,
  canCompare,
  projectSlug,
}: {
  webhook: Webhook;
  isSelected: boolean;
  onSelect: (webhook: Webhook) => void;
  onCompare: (webhook: Webhook) => void;
  canCompare: boolean;
  projectSlug: string;
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
      <div className="w-full p-4 group">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => onSelect(webhook)}
            className="flex-1 min-w-0 text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Badge
                className={`text-xs font-semibold ${getMethodColor(webhook.method)}`}
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
              {webhook.direction === 'outgoing' &&
                webhook.responseStatus && (
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium tabular-nums border bg-transparent ${
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
                  className="text-xs font-medium tabular-nums border-border/50 bg-muted/30 text-muted-foreground gap-1 sm:hidden"
                >
                  <Timer className="h-3 w-3" />
                  {webhook.duration}ms
                </Badge>
              )}
              <div className="ml-auto flex items-center text-xs text-muted-foreground">
                <RelativeTime timestamp={webhook.timestamp} />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/80">
              <div className="flex items-center gap-1.5" title="Header count">
                <Layers className="h-3 w-3 opacity-70" />
                <span className="font-medium">
                  {Object.keys(webhook.headers).length}
                </span>
              </div>
              {webhook.body && (
                <div className="flex items-center gap-1.5" title="Body size">
                  <FileJson className="h-3 w-3 opacity-70" />
                  <span className="tabular-nums">
                    {new Blob([webhook.body]).size} B
                  </span>
                </div>
              )}
              {webhook.duration !== undefined && (
                <div className="flex items-center gap-1.5" title="Duration">
                  <Clock className="h-3 w-3 opacity-70" />
                  <span className="tabular-nums font-medium">
                    {webhook.duration}ms
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 ml-auto" title="Webhook ID">
                <Hash className="h-3 w-3 opacity-70" />
                <span className="font-mono tabular-nums">
                  {webhook.id.slice(0, 8)}
                </span>
              </div>
            </div>
          </button>
          <div className="flex flex-col gap-1 shrink-0 transition-opacity">
            <div className="opacity-70 group-hover:opacity-100 transition-opacity">
              <CopyButton
                text={`${typeof window !== 'undefined' ? window.location.origin : ''}/${projectSlug}?webhook=${webhook.id}`}
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                title="Copy link to webhook"
              />
            </div>
            <div
              className={`opacity-70 group-hover:opacity-100 transition-opacity ${canCompare ? '' : 'invisible'}`}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-primary/10"
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
}: WebhookListProps) {
  const [diffOpen, setDiffOpen] = useState(false);
  const [diffWebhookA, setDiffWebhookA] = useState<Webhook | null>(null);
  const [diffWebhookB, setDiffWebhookB] = useState<Webhook | null>(null);
  const selectedId = selectedWebhook?.id;

  const handleCompare = (webhook: Webhook) => {
    if (selectedWebhook && selectedWebhook.id !== webhook.id) {
      setDiffWebhookA(selectedWebhook);
      setDiffWebhookB(webhook);
      setDiffOpen(true);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-foreground">Webhooks</h2>
          <Badge variant="secondary" className="text-xs bg-primary/10">
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
        {webhooks.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 min-h-0">
        {webhooks.length === 0 ? (
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
              />
            ))}
          </div>
        )}
      </ScrollArea>
      {diffWebhookA && diffWebhookB && (
        <WebhookDiff
          webhookA={diffWebhookA}
          webhookB={diffWebhookB}
          open={diffOpen}
          onOpenChange={setDiffOpen}
        />
      )}
    </div>
  );
}
