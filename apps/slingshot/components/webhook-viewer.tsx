'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
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

  // Always start with server-provided initialWebhooks to avoid hydration mismatch
  const [webhooks, setWebhooks] = useState<Webhook[]>(initialWebhooks);

  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(() => {
    if (initialWebhooks.length === 0) {
      return null;
    }

    if (webhookIdFromQuery) {
      return (
        initialWebhooks.find((w) => w.id === webhookIdFromQuery) ||
        initialWebhooks[0]
      );
    }
    return initialWebhooks[0];
  });

  // SWR for polling updates (metadata only when unchanged)
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
        webhooks: webhooks.length > 0 ? webhooks : undefined,
        etag: undefined,
      },
    },
  );

  // Hydrate from cache after mount (client-side only) to avoid hydration mismatch
  useEffect(() => {
    const cachedEntry = getCachedWebhooksEntry(projectSlug);
    if (cachedEntry?.webhooks && cachedEntry.webhooks.length > 0) {
      setWebhooks(cachedEntry.webhooks);
      // Update selected webhook if needed
      if (webhookIdFromQuery) {
        const found = cachedEntry.webhooks.find(
          (w) => w.id === webhookIdFromQuery,
        );
        if (found) {
          setSelectedWebhook(found);
        }
      } else if (!selectedWebhook && cachedEntry.webhooks.length > 0) {
        setSelectedWebhook(cachedEntry.webhooks[0]);
      }
    }
    // If we loaded stale cache data, kick off an immediate metadata check.
    if (cachedEntry?.stale) {
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Handle SWR updates
  useEffect(() => {
    if (pollResult?.changed && pollResult.webhooks) {
      setWebhooks(pollResult.webhooks);
      setCachedWebhooks(
        projectSlug,
        pollResult.webhooks,
        pollResult.etag,
        initialMaxSize,
      );

      // Select new webhook if none selected or if it's the newest one
      if (pollResult.webhooks.length > 0) {
        // If nothing selected, select first
        if (!selectedWebhook) {
          setSelectedWebhook(pollResult.webhooks[0]);
        }
        // If query param is set, respect it, otherwise maybe auto-select?
        // Let's stick to existing behavior: if a new webhook comes in and we're just viewing the list (no specific selection or viewing the top one), we might want to show it.
        // But typically we don't change selection unless user does it or it's the first load.
        // The SSE implementation auto-selected if !selectedWebhook && !webhookIdFromQuery
        else if (
          selectedWebhook &&
          !webhookIdFromQuery &&
          selectedWebhook.id === webhooks[0]?.id &&
          pollResult.webhooks[0].id !== selectedWebhook.id
        ) {
          // If we were looking at the top one, switch to the new top one?
          // Actually, let's just update the list. The user can click.
          // Exception: if we have NO selection, select the first.
        }
      }
    }
  }, [pollResult, projectSlug, selectedWebhook, webhookIdFromQuery, webhooks]);

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

  useEffect(() => {
    // Persist initial server data only when we have something meaningful to store.
    if (initialWebhooks.length > 0 || initialEtag) {
      setCachedWebhooks(
        projectSlug,
        initialWebhooks,
        initialEtag || undefined,
        initialMaxSize,
      );
    }
  }, [projectSlug, initialWebhooks, initialEtag, initialMaxSize]);

  // Manual refresh
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      mutate();
    }
  }, [refreshTrigger, mutate]);

  const handleClearHistory = useCallback(async () => {
    if (!confirm('Are you sure you want to clear all webhook history?')) {
      return;
    }

    try {
      await clearWebhooksAction(projectSlug);
      setWebhooks([]);
      setSelectedWebhook(null);
      clearCachedWebhooks(projectSlug);
      mutate(); // Trigger re-fetch/update
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, [projectSlug, mutate]);

  return (
    <div className="rounded-lg border border-border/50 shadow-md bg-card flex-1 overflow-hidden flex flex-col min-h-0">
      <PanelGroup direction="horizontal" className="h-full min-h-0">
        <Panel defaultSize={30} minSize={20} maxSize={50} className="min-h-0">
          <WebhookList
            webhooks={webhooks}
            selectedWebhook={selectedWebhook}
            onSelectWebhook={handleSelectWebhook}
            onClearHistory={handleClearHistory}
            isConnected={!swrError}
            projectSlug={projectSlug}
          />
        </Panel>
        <PanelResizeHandle className="w-2 bg-border/50 hover:bg-primary/30 transition-colors" />
        <Panel defaultSize={70} minSize={50} className="min-h-0">
          <WebhookDetail webhook={selectedWebhook} onResend={onResend} />
        </Panel>
      </PanelGroup>
    </div>
  );
}
