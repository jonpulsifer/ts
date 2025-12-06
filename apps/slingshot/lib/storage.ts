import { getBucket } from './gcs-client';
import { resetProjectStats } from './stats-storage';
import type { Webhook, WebhookHistory } from './types';

const MAX_WEBHOOKS = 100;

/**
 * Check if webhooks file has changed (using metadata only, no download)
 * Returns etag and updated timestamp if file exists
 */
export async function checkWebhooksChanged(
  slug: string,
  source: 'client' | 'server' = 'server',
): Promise<{ changed: boolean; etag: string | null; updated: number | null }> {
  const key = `projects/${slug}/webhooks.json`;

  try {
    const bucket = await getBucket();
    const file = bucket.file(key);

    const [exists] = await file.exists();
    if (!exists) {
      return { changed: false, etag: null, updated: null };
    }

    // Only get metadata, don't download
    const [metadata] = await file.getMetadata();
    const etag = metadata.etag || null;
    const updated = metadata.updated
      ? new Date(metadata.updated).getTime()
      : null;

    return { changed: true, etag, updated };
  } catch (error) {
    console.error(`[GCS] Error checking webhooks metadata for ${slug} (source: ${source}):`, error);
    return { changed: false, etag: null, updated: null };
  }
}

/**
 * Get webhooks from storage (Google Cloud Storage)
 * slug is used as the project ID
 */
export async function getWebhooks(
  slug: string,
  source: 'client' | 'server' = 'server',
): Promise<{ data: WebhookHistory | null; etag: string | null }> {
  const key = `projects/${slug}/webhooks.json`;

  console.log(`[GCS] getWebhooks called for project: ${slug} (source: ${source})`);

  try {
    const bucket = await getBucket();
    const file = bucket.file(key);

    console.log(`[GCS] Checking if file exists: ${key} (source: ${source})`);
    const [exists] = await file.exists();
    if (!exists) {
      console.log(`[GCS] File does not exist: ${key} (source: ${source})`);
      return { data: null, etag: null };
    }

    console.log(`[GCS] Downloading file: ${key} (source: ${source})`);
    const [contents] = await file.download();
    const data = JSON.parse(contents.toString('utf-8')) as WebhookHistory;

    // Migrate: ensure all webhooks have direction field (default to 'incoming' for legacy webhooks)
    if (data.webhooks) {
      data.webhooks = data.webhooks.map((webhook) => ({
        ...webhook,
        direction: webhook.direction || 'incoming',
      }));
    }

    console.log(`[GCS] Retrieved ${data.webhooks?.length || 0} webhooks from ${key} (source: ${source})`);

    // Get metadata for etag
    console.log(`[GCS] Getting metadata for: ${key} (source: ${source})`);
    const [metadata] = await file.getMetadata();
    const etag = metadata.etag || null;

    return { data, etag };
  } catch (error) {
    // Return null data if GCS operation fails (e.g., during build)
    console.error(`[GCS] Error getting webhooks for ${slug} (source: ${source}):`, error);
    return { data: null, etag: null };
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
  console.log(`[GCS] saveWebhooks called for project: ${slug}, saving ${trimmedWebhooks.length} webhooks`);

  const bucket = await getBucket();
  const file = bucket.file(key);

  console.log(`[GCS] Saving file: ${key} (${trimmedWebhooks.length} webhooks)`);
  await file.save(JSON.stringify(data), {
    contentType: 'application/json',
    metadata: {
      cacheControl: 'no-cache',
    },
  });

  // Get metadata for etag
  console.log(`[GCS] Getting metadata after save for: ${key}`);
  const [metadata] = await file.getMetadata();
  return metadata.etag || '';
}

/**
 * Clear webhooks for a project
 * slug is used as the project ID
 */
export async function clearWebhooks(slug: string): Promise<void> {
  const key = `projects/${slug}/webhooks.json`;
  console.log(`[GCS] clearWebhooks called for project: ${slug}`);

  const bucket = await getBucket();
  const file = bucket.file(key);

  try {
    console.log(`[GCS] Deleting file: ${key}`);
    await file.delete();
    console.log(`[GCS] Successfully deleted file: ${key}`);
  } catch (error) {
    // Ignore errors (file might not exist)
    console.log(`[GCS] File does not exist or delete failed: ${key}`, error);
  }

  // Reset stats for this project
  await resetProjectStats(slug);
}
