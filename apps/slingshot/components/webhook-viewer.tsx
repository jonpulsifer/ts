'use client';

import { Clock, FileJson, Hash, Timer } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import {
  type ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import useSWR from 'swr';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useIsMobile } from '@/hooks/use-mobile';
import { clearWebhooksAction, pollWebhooksAction } from '@/lib/actions';
import type { Webhook } from '@/lib/types';
import {
  clearCachedWebhooks,
  getCachedEtag,
  getCachedWebhooksEntry,
  setCachedWebhooks,
} from '@/lib/webhook-cache';
import { WebhookDetail } from './webhook-detail';
import { WebhookList } from './webhook-list';

const methodBadge = (method: string) => {
  const colors: Record<string, string> = {
    GET: 'bg-blue-500/15 text-blue-400',
    POST: 'bg-green-500/15 text-green-400',
    PUT: 'bg-yellow-500/15 text-yellow-400',
    PATCH: 'bg-orange-500/15 text-orange-400',
    DELETE: 'bg-red-500/15 text-red-400',
  };
  return colors[method] || 'bg-gray-500/15 text-gray-400';
};

interface WebhookViewerProps {
  projectSlug: string;
  initialWebhooks: Webhook[];
  onResend?: (webhook: Webhook) => void;
  refreshTrigger?: number;
  initialEtag?: string | null;
  initialMaxSize?: number;
}

export function WebhookViewer({
  projectSlug,
  initialWebhooks,
  onResend,
  refreshTrigger,
  initialEtag,
  initialMaxSize = 100,
}: WebhookViewerProps) {
  const searchParams = useSearchParams();
  const webhookIdFromQuery = searchParams.get('webhook');
  const [, startTransition] = useTransition();
  const isMobile = useIsMobile();
  const listPanelRef = useRef<ImperativePanelHandle>(null);
  const detailPanelRef = useRef<ImperativePanelHandle>(null);

  // Local-first: Initialize from cache if available, otherwise use server data
  const [webhooks, setWebhooks] = useState<Webhook[]>(() => {
    if (typeof window === 'undefined') {
      return initialWebhooks;
    }
    const cached = getCachedWebhooksEntry(projectSlug);
    return cached && cached.webhooks.length > 0
      ? cached.webhooks
      : initialWebhooks;
  });

  // Initialize selected webhook from initial data
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(() => {
    const webhooksToUse = webhooks.length > 0 ? webhooks : initialWebhooks;
    if (webhooksToUse.length === 0) {
      return null;
    }
    if (webhookIdFromQuery) {
      return (
        webhooksToUse.find((w) => w.id === webhookIdFromQuery) ||
        webhooksToUse[0]
      );
    }
    return webhooksToUse[0];
  });
  const [diffTarget, setDiffTarget] = useState<Webhook | null>(null);
  const [detailTab, setDetailTab] = useState<
    'headers' | 'body' | 'response' | 'raw' | 'diff'
  >('headers');

  // SWR for polling updates (uses etag for efficient checks)
  const {
    data: pollResult,
    mutate,
    error: swrError,
  } = useSWR(
    ['webhooks', projectSlug],
    async () => {
      const currentEtag = getCachedEtag(projectSlug);
      return pollWebhooksAction(projectSlug, currentEtag);
    },
    {
      refreshInterval: 2000,
      revalidateOnFocus: true,
      dedupingInterval: 1000,
      fallbackData: {
        changed: false,
        webhooks: undefined,
        etag: undefined,
      },
    },
  );

  // Hydrate from cache on mount and persist server data
  useEffect(() => {
    const cachedEntry = getCachedWebhooksEntry(projectSlug);

    // If we have cached data that's different from current state, update it
    if (cachedEntry && cachedEntry.webhooks.length > 0) {
      const cachedWebhooks = cachedEntry.webhooks;
      // Only update if cache is different (avoid unnecessary transitions)
      if (
        cachedWebhooks.length !== webhooks.length ||
        cachedWebhooks[0]?.id !== webhooks[0]?.id
      ) {
        startTransition(() => {
          setWebhooks(cachedWebhooks);
          // Update selected webhook if needed
          if (webhookIdFromQuery) {
            const found = cachedWebhooks.find(
              (w) => w.id === webhookIdFromQuery,
            );
            if (found) {
              setSelectedWebhook(found);
            }
          } else if (!selectedWebhook && cachedWebhooks.length > 0) {
            setSelectedWebhook(cachedWebhooks[0]);
          }
        });
      }

      // If cache is stale, trigger background refresh
      if (cachedEntry.stale) {
        mutate();
      }
    }

    // Persist initial server data to cache
    if (initialWebhooks.length > 0 || initialEtag) {
      setCachedWebhooks(
        projectSlug,
        initialWebhooks,
        initialEtag || undefined,
        initialMaxSize,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Handle SWR polling updates with transitions
  useEffect(() => {
    if (pollResult?.changed && pollResult.webhooks) {
      startTransition(() => {
        setWebhooks(pollResult.webhooks);
        setCachedWebhooks(
          projectSlug,
          pollResult.webhooks,
          pollResult.etag,
          initialMaxSize,
        );

        // Auto-select newest webhook if viewing the top one
        if (pollResult.webhooks.length > 0) {
          if (!selectedWebhook) {
            setSelectedWebhook(pollResult.webhooks[0]);
          } else if (
            !webhookIdFromQuery &&
            selectedWebhook.id === webhooks[0]?.id &&
            pollResult.webhooks[0].id !== selectedWebhook.id
          ) {
            // If viewing the top webhook and a new one arrived, switch to it
            setSelectedWebhook(pollResult.webhooks[0]);
          }
        }
      });
    }
  }, [
    pollResult,
    projectSlug,
    selectedWebhook,
    webhookIdFromQuery,
    webhooks,
    initialMaxSize,
  ]);

  // Update selected webhook when query string changes
  useEffect(() => {
    if (webhookIdFromQuery) {
      const found = webhooks.find((w) => w.id === webhookIdFromQuery);
      if (found && found.id !== selectedWebhook?.id) {
        setSelectedWebhook(found);
      }
    } else if (!webhookIdFromQuery && selectedWebhook && webhooks.length > 0) {
      if (!webhooks.some((w) => w.id === selectedWebhook.id)) {
        setSelectedWebhook(webhooks[0] || null);
      }
    }
  }, [webhookIdFromQuery, webhooks, selectedWebhook]);

  // Update URL when webhook is selected
  const handleSelectWebhook = useCallback((webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setDiffTarget(null);
    setDetailTab('headers');

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('webhook', webhook.id);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, []);

  const handleCompare = useCallback(
    (webhook: Webhook) => {
      if (selectedWebhook && webhook.id !== selectedWebhook.id) {
        setDiffTarget(webhook);
        setDetailTab('diff');
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    },
    [selectedWebhook],
  );

  // Manual refresh with transition
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      startTransition(() => {
        mutate();
      });
    }
  }, [refreshTrigger, mutate]);

  const handleClearHistory = useCallback(async () => {
    if (!confirm('Are you sure you want to clear all webhook history?')) {
      return;
    }

    try {
      await clearWebhooksAction(projectSlug);
      startTransition(() => {
        setWebhooks([]);
        setSelectedWebhook(null);
      });
      clearCachedWebhooks(projectSlug);
      mutate(); // Trigger re-fetch/update
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, [projectSlug, mutate]);

  const panelGroupId = useMemo(
    () => `webhook-viewer-panels-${projectSlug}`,
    [projectSlug],
  );
  const listPanelId = `${panelGroupId}-list`;
  const detailPanelId = `${panelGroupId}-detail`;
  const resizeHandleId = `${panelGroupId}-resize`;

  if (isMobile) {
    return (
      <div className="rounded-lg border border-border/50 shadow-md bg-card flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="p-3 border-b border-border/50 flex items-center justify-between gap-2 bg-muted/20">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Webhooks</h2>
            <span className="text-xs text-muted-foreground">
              {webhooks.length}
            </span>
          </div>
          {webhooks.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-xs text-destructive hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        {webhooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
            <span className="text-sm text-muted-foreground">
              No webhooks yet. Send one to see it here.
            </span>
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="flex-1 overflow-auto"
            defaultValue={selectedWebhook?.id}
          >
            {webhooks.map((webhook) => (
              <AccordionItem value={webhook.id} key={webhook.id}>
                <AccordionTrigger
                  className="px-3 py-2 text-left hover:no-underline data-[state=open]:no-underline"
                  onClick={() => handleSelectWebhook(webhook)}
                >
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground w-full">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-sm uppercase tracking-tight ${methodBadge(
                        webhook.method,
                      )}`}
                    >
                      {webhook.method}
                    </span>
                    <span className="text-[11px] uppercase">
                      {webhook.direction === 'incoming' ? 'IN' : 'OUT'}
                    </span>
                    {webhook.responseStatus !== undefined && (
                      <span
                        className={[
                          'text-[11px] px-2 py-0.5 rounded-sm border',
                          webhook.responseStatus >= 200 &&
                          webhook.responseStatus < 300
                            ? 'border-green-500/40 text-green-400 bg-green-500/10'
                            : webhook.responseStatus >= 400
                              ? 'border-red-500/40 text-red-400 bg-red-500/10'
                              : 'border-amber-500/40 text-amber-400 bg-amber-500/10',
                        ].join(' ')}
                      >
                        {webhook.responseStatus}
                      </span>
                    )}
                    {webhook.body && (
                      <span className="flex items-center gap-1">
                        <FileJson className="h-3 w-3 opacity-70" />
                        <span className="tabular-nums">
                          {new Blob([webhook.body]).size} B
                        </span>
                      </span>
                    )}
                    {webhook.duration !== undefined && (
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3 opacity-70" />
                        <span className="tabular-nums">
                          {webhook.duration}ms
                        </span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 opacity-70" />
                      <span>
                        {new Date(webhook.timestamp).toLocaleDateString()}{' '}
                        {new Date(webhook.timestamp).toLocaleTimeString()}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 font-mono text-foreground">
                      <Hash className="h-3 w-3 opacity-70" />
                      {webhook.id.slice(0, 8)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-3">
                  <WebhookDetail
                    webhook={webhook}
                    onResend={onResend}
                    compareWebhook={null}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 shadow-md bg-card flex-1 overflow-hidden flex flex-col min-h-0">
      <PanelGroup
        id={panelGroupId}
        direction="horizontal"
        className="h-full min-h-0"
      >
        <Panel
          id={listPanelId}
          ref={listPanelRef}
          defaultSize={28}
          minSize={18}
          maxSize={50}
          className="min-h-0"
        >
          <WebhookList
            webhooks={webhooks}
            selectedWebhook={selectedWebhook}
            onSelectWebhook={handleSelectWebhook}
            onClearHistory={handleClearHistory}
            isConnected={!swrError}
            projectSlug={projectSlug}
            onCompare={handleCompare}
          />
        </Panel>
        <PanelResizeHandle
          id={resizeHandleId}
          className="w-2 bg-border/50 hover:bg-primary/30 transition-colors"
        />
        <Panel
          id={detailPanelId}
          ref={detailPanelRef}
          defaultSize={70}
          minSize={50}
          className="min-h-0"
        >
          <WebhookDetail
            webhook={selectedWebhook}
            onResend={onResend}
            compareWebhook={diffTarget}
            activeTabExternal={detailTab as any}
            onActiveTabChange={setDetailTab as any}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
