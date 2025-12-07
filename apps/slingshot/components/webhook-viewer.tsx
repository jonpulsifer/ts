'use client';

import { useSearchParams } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import useSWR from 'swr';
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
  const urlUpdateTimeoutRef = useRef<number | null>(null);
  const [, startTransition] = useTransition();

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

    // Clear pending update
    if (urlUpdateTimeoutRef.current) {
      cancelAnimationFrame(urlUpdateTimeoutRef.current);
    }

    // Lightweight URL update so rapid clicks stay instant
    urlUpdateTimeoutRef.current = requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      params.set('webhook', webhook.id);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    });
  }, []);

  // Clean up any pending URL update on unmount
  useEffect(
    () => () => {
      if (urlUpdateTimeoutRef.current) {
        cancelAnimationFrame(urlUpdateTimeoutRef.current);
      }
    },
    [],
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

  return (
    <div className="rounded-lg border border-border/50 shadow-md bg-card flex-1 overflow-hidden flex flex-col min-h-0">
      <PanelGroup
        id={panelGroupId}
        direction="horizontal"
        className="h-full min-h-0"
      >
        <Panel
          id={listPanelId}
          defaultSize={30}
          minSize={20}
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
          />
        </Panel>
        <PanelResizeHandle
          id={resizeHandleId}
          className="w-2 bg-border/50 hover:bg-primary/30 transition-colors"
        />
        <Panel
          id={detailPanelId}
          defaultSize={70}
          minSize={50}
          className="min-h-0"
        >
          <WebhookDetail webhook={selectedWebhook} onResend={onResend} />
        </Panel>
      </PanelGroup>
    </div>
  );
}
