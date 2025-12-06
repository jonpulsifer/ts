import { del, head, put } from '@vercel/blob';
import { resetProjectStats } from './stats-storage';
import type { Webhook, WebhookHistory } from './types';

const MAX_WEBHOOKS = 100;

/**
 * Get webhooks from storage (Vercel Blob)
 * slug is used as the project ID
 */
export async function getWebhooks(
  slug: string,
): Promise<{ data: WebhookHistory | null; etag: string | null }> {
  const key = `projects/${slug}/webhooks.json`;

  try {
    const blob = await head(key);

    if (!blob) {
      return { data: null, etag: null };
    }

    const response = await fetch(blob.url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { data: null, etag: null };
      }
      throw new Error(`Failed to fetch webhooks: ${response.statusText}`);
    }

    const data = (await response.json()) as WebhookHistory;

    // Migrate: ensure all webhooks have direction field (default to 'incoming' for legacy webhooks)
    if (data?.webhooks) {
      data.webhooks = data.webhooks.map((webhook) => ({
        ...webhook,
        direction: webhook.direction || 'incoming',
      }));
    }

    // Use the blob URL or hash as a simple etag substitute
    const etag = blob.url.split('/').pop() || null;
    return { data, etag };
  } catch (error: any) {
    // Handle blob not found errors - return null data
    if (
      error?.status === 404 ||
      error?.statusCode === 404 ||
      error?.message?.includes('404') ||
      error?.message?.includes('not found') ||
      error?.message?.includes('does not exist') ||
      error?.message?.includes('BlobNotFoundError') ||
      error?.name === 'BlobNotFoundError'
    ) {
      return { data: null, etag: null };
    }
    throw error;
  }
}

/**
 * Save webhooks to storage
 * slug is used as the project ID
 */
export async function saveWebhooks(
  slug: string,
  webhooks: Webhook[],
): Promise<string> {
  const trimmedWebhooks = webhooks.slice(0, MAX_WEBHOOKS);

  const data: WebhookHistory = {
    webhooks: trimmedWebhooks,
    maxSize: MAX_WEBHOOKS,
  };

  const key = `projects/${slug}/webhooks.json`;

  const blob = await put(key, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
  });

  // Use URL hash as etag substitute
  return blob.url.split('/').pop() || '';
}

/**
 * Clear webhooks for a project
 * slug is used as the project ID
 */
export async function clearWebhooks(slug: string): Promise<void> {
  const key = `projects/${slug}/webhooks.json`;
  await del(key);

  // Reset stats for this project
  await resetProjectStats(slug);
}
