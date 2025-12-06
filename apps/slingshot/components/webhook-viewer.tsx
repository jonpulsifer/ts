'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import useSWR from 'swr';
import {
  clearWebhooksAction,
  pollWebhooksAction,
} from '@/lib/actions';
import type { Webhook } from '@/lib/types';
import {
  clearCachedWebhooks,
  getCachedEtag,
  getCachedWebhooks,
  setCachedWebhooks,
} from '@/lib/webhook-cache';
import { WebhookDetail } from './webhook-detail';
import { WebhookList } from './webhook-list';

interface WebhookViewerProps {
  projectSlug: string;
  initialWebhooks: Webhook[];
  onResend?: (webhook: Webhook) => void;
  refreshTrigger?: number;
}

export function WebhookViewer({
  projectSlug,
  initialWebhooks,
  onResend,
  refreshTrigger,
}: WebhookViewerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Local state to manage webhooks (combining initial, cached, and SWR updates)
  const [webhooks, setWebhooks] = useState<Webhook[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = getCachedWebhooks(projectSlug);
      if (cached && cached.length > 0) {
        return cached;
      }
    }
    return initialWebhooks;
  });

  // Get webhook ID from query string
  const webhookIdFromQuery = searchParams.get('webhook');

  const getInitialSelectedWebhook = useCallback(() => {
    // First check localStorage cache
    if (typeof window !== 'undefined') {
      const cached = getCachedWebhooks(projectSlug);
      if (cached && cached.length > 0) {
        if (webhookIdFromQuery) {
          const found = cached.find((w) => w.id === webhookIdFromQuery);
          if (found) return found;
        }
        return cached[0] || null;
      }
    }
    // Fallback to initialWebhooks
    if (webhookIdFromQuery && initialWebhooks.length > 0) {
      const found = initialWebhooks.find((w) => w.id === webhookIdFromQuery);
      if (found) return found;
    }
    return initialWebhooks[0] || null;
  }, [webhookIdFromQuery, initialWebhooks, projectSlug]);

  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(
    getInitialSelectedWebhook(),
  );

  // SWR for polling updates
  // Only runs on client
  const { data: pollResult, mutate, error: swrError } = useSWR(
    mounted ? ['webhooks', projectSlug] : null,
    async () => {
      const currentEtag = getCachedEtag(projectSlug);
      return pollWebhooksAction(projectSlug, currentEtag);
    },
    {
      refreshInterval: 2000, // Poll every 2 seconds
      revalidateOnFocus: true,
      dedupingInterval: 1000,
    }
  );

  // Handle SWR updates
  useEffect(() => {
    if (pollResult?.changed && pollResult.webhooks) {
      setWebhooks(pollResult.webhooks);
      setCachedWebhooks(projectSlug, pollResult.webhooks, pollResult.etag);

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
        else if (!webhookIdFromQuery && selectedWebhook.id === webhooks[0]?.id && pollResult.webhooks[0].id !== selectedWebhook.id) {
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
  const handleSelectWebhook = useCallback(
    (webhook: Webhook) => {
      setSelectedWebhook(webhook);
      const params = new URLSearchParams(searchParams.toString());
      params.set('webhook', webhook.id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  useEffect(() => {
    setMounted(true);
    if (initialWebhooks.length > 0) {
      setCachedWebhooks(projectSlug, initialWebhooks);
    }
  }, [projectSlug, initialWebhooks]);

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

  if (!mounted) {
    return (
      <div className="rounded-lg border border-border/50 shadow-md bg-card flex-1 overflow-hidden flex flex-col">
        <div className="flex h-full">
          <div className="flex-1 border-r border-border/50">
            <WebhookList
              webhooks={webhooks}
              selectedWebhook={selectedWebhook}
              onSelectWebhook={handleSelectWebhook}
              onClearHistory={handleClearHistory}
              isConnected={true} // SWR is "connected" in terms of polling
              projectSlug={projectSlug}
            />
          </div>
          <div className="flex-[2]">
            <WebhookDetail webhook={selectedWebhook} onResend={onResend} />
          </div>
        </div>
      </div>
    );
  }

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
