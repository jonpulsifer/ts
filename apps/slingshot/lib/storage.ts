import { getBucket } from './gcs-client';
import { resetProjectStats } from './stats-storage';
import type { Webhook, WebhookHistory } from './types';

const MAX_WEBHOOKS = 100;

/**
 * Get webhooks from storage (Google Cloud Storage)
 * slug is used as the project ID
 */
export async function getWebhooks(
  slug: string,
): Promise<{ data: WebhookHistory | null; etag: string | null }> {
  const key = `projects/${slug}/webhooks.json`;
  const bucket = await getBucket();
  const file = bucket.file(key);

  try {
    const [exists] = await file.exists();
    if (!exists) {
      return { data: null, etag: null };
    }

    const [contents] = await file.download();
    const data = JSON.parse(contents.toString('utf-8')) as WebhookHistory;

    // Migrate: ensure all webhooks have direction field (default to 'incoming' for legacy webhooks)
    if (data?.webhooks) {
      data.webhooks = data.webhooks.map((webhook) => ({
        ...webhook,
        direction: webhook.direction || 'incoming',
      }));
    }

    // Get metadata for etag
    const [metadata] = await file.getMetadata();
    const etag = metadata.etag || null;

    return { data, etag };
  } catch (error: any) {
    // Handle file not found errors - return null data
    if (
      error?.code === 404 ||
      error?.statusCode === 404 ||
      error?.message?.includes('404') ||
      error?.message?.includes('not found') ||
      error?.message?.includes('does not exist')
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
  const bucket = await getBucket();
  const file = bucket.file(key);

  await file.save(JSON.stringify(data), {
    contentType: 'application/json',
    metadata: {
      cacheControl: 'no-cache',
    },
  });

  // Get metadata for etag
  const [metadata] = await file.getMetadata();
  return metadata.etag || '';
}

/**
 * Clear webhooks for a project
 * slug is used as the project ID
 */
export async function clearWebhooks(slug: string): Promise<void> {
  const key = `projects/${slug}/webhooks.json`;
  const bucket = await getBucket();
  const file = bucket.file(key);

  try {
    await file.delete();
  } catch (error: any) {
    // Ignore 404 errors (file doesn't exist)
    if (error?.code !== 404 && error?.statusCode !== 404) {
      throw error;
    }
  }

  // Reset stats for this project
  await resetProjectStats(slug);
}
