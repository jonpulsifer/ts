'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { clearWebhooksAction, getWebhooksAction } from '@/lib/actions';
import type { Webhook } from '@/lib/types';
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
  const [webhooks, setWebhooks] = useState<Webhook[]>(initialWebhooks);
  const [isConnected, setIsConnected] = useState(false);

  // Get webhook ID from query string
  const webhookIdFromQuery = searchParams.get('webhook');

  // Find initial selected webhook from query string or default to first
  const getInitialSelectedWebhook = useCallback(() => {
    if (webhookIdFromQuery && initialWebhooks.length > 0) {
      const found = initialWebhooks.find((w) => w.id === webhookIdFromQuery);
      if (found) return found;
    }
    return initialWebhooks[0] || null;
  }, [webhookIdFromQuery, initialWebhooks]);

  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(
    getInitialSelectedWebhook(),
  );

  // Update selected webhook when query string changes
  useEffect(() => {
    if (webhookIdFromQuery && webhooks.length > 0) {
      const found = webhooks.find((w) => w.id === webhookIdFromQuery);
      if (found && found.id !== selectedWebhook?.id) {
        setSelectedWebhook(found);
      }
    } else if (!webhookIdFromQuery && selectedWebhook && webhooks.length > 0) {
      // If query string is removed, select first webhook if none selected
      if (!webhooks.some((w) => w.id === selectedWebhook.id)) {
        setSelectedWebhook(webhooks[0] || null);
      }
    }
  }, [webhookIdFromQuery, webhooks, selectedWebhook]);

  // Update URL when webhook is selected (without reload)
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
  }, []);

  // Refresh webhooks when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      const fetchWebhooks = async () => {
        try {
          const data = await getWebhooksAction(projectSlug);
          const updatedWebhooks = data.webhooks || [];
          setWebhooks(updatedWebhooks);
          // Only auto-select newest if no webhook is currently selected
          if (updatedWebhooks.length > 0 && !selectedWebhook) {
            setSelectedWebhook(updatedWebhooks[0]);
          }
        } catch (error) {
          console.error('Failed to refresh webhooks:', error);
        }
      };
      fetchWebhooks();
    }
  }, [refreshTrigger, projectSlug, selectedWebhook]);

  // SSE connection for real-time updates (only on project pages)
  useEffect(() => {
    // Only connect if we have a valid project slug
    if (!projectSlug) {
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connect = () => {
      try {
        eventSource = new EventSource(`/api/stream/${projectSlug}`);

        eventSource.onopen = () => {
          setIsConnected(true);
          reconnectAttempts = 0; // Reset on successful connection
        };

        eventSource.onmessage = (event) => {
          if (event.data.startsWith(':')) {
            // Comment/heartbeat, ignore
            return;
          }

          try {
            const newWebhook: Webhook = JSON.parse(event.data);

            // Add new webhook to the list
            setWebhooks((prev) => {
              // Check if webhook already exists (avoid duplicates)
              if (prev.some((w) => w.id === newWebhook.id)) {
                return prev;
              }
              return [newWebhook, ...prev];
            });

            // Auto-select the newest webhook only if no webhook is currently selected and no query param
            if (!selectedWebhook && !webhookIdFromQuery) {
              setSelectedWebhook(newWebhook);
              // Update URL to include the new webhook
              const params = new URLSearchParams();
              params.set('webhook', newWebhook.id);
              router.replace(`${pathname}?${params.toString()}`, {
                scroll: false,
              });
            }
          } catch (error) {
            console.error('Failed to parse webhook event:', error);
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();

          // Exponential backoff for reconnection, with max attempts
          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(3000 * 2 ** reconnectAttempts, 30000); // Max 30s
            reconnectAttempts++;
            reconnectTimeout = setTimeout(() => {
              connect();
            }, delay);
          } else {
            console.warn(
              'Max SSE reconnection attempts reached. Falling back to polling.',
            );
          }
        };
      } catch (error) {
        console.error('Failed to connect to SSE:', error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      eventSource?.close();
      setIsConnected(false);
    };
    // Only reconnect if projectSlug changes, not when selectedWebhook changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSlug]);

  // Poll for updates as fallback (every 2 seconds)
  useEffect(() => {
    // Skip polling if connected to SSE
    if (isConnected) return;

    const pollInterval = setInterval(async () => {
      try {
        const data = await getWebhooksAction(projectSlug);
        const updatedWebhooks = data.webhooks || [];
        setWebhooks(updatedWebhooks);

        // Preserve selected webhook if it still exists, otherwise select based on query or newest
        if (selectedWebhook) {
          const stillExists = updatedWebhooks.some(
            (w: Webhook) => w.id === selectedWebhook.id,
          );
          if (!stillExists) {
            if (webhookIdFromQuery) {
              const found = updatedWebhooks.find(
                (w) => w.id === webhookIdFromQuery,
              );
              if (found) {
                setSelectedWebhook(found);
              } else if (updatedWebhooks.length > 0) {
                setSelectedWebhook(updatedWebhooks[0]);
                router.replace(pathname, { scroll: false });
              }
            } else if (updatedWebhooks.length > 0) {
              setSelectedWebhook(updatedWebhooks[0]);
            }
          }
        } else if (updatedWebhooks.length > 0) {
          if (webhookIdFromQuery) {
            const found = updatedWebhooks.find(
              (w) => w.id === webhookIdFromQuery,
            );
            setSelectedWebhook(found || updatedWebhooks[0]);
          } else {
            setSelectedWebhook(updatedWebhooks[0]);
          }
        }
      } catch (error) {
        console.error('Failed to poll webhooks:', error);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [
    isConnected,
    projectSlug,
    selectedWebhook,
    webhookIdFromQuery,
    router,
    pathname,
  ]);

  const handleClearHistory = useCallback(async () => {
    if (!confirm('Are you sure you want to clear all webhook history?')) {
      return;
    }

    try {
      await clearWebhooksAction(projectSlug);
      setWebhooks([]);
      setSelectedWebhook(null);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, [projectSlug]);

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
              isConnected={isConnected}
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
            isConnected={isConnected}
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
