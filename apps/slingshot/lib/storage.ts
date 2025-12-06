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
): Promise<{ changed: boolean; etag: string | null; updated: number | null }> {
  const key = `projects/${slug}/webhooks.json`;

  try {
    const bucket = await getBucket();
    const file = bucket.file(key);

    // Only get metadata, don't download (this will throw 404 if file doesn't exist)
    const [metadata] = await file.getMetadata();
    const etag = metadata.etag || null;
    const updated = metadata.updated
      ? new Date(metadata.updated).getTime()
      : null;

    return { changed: true, etag, updated };
  } catch (error: any) {
    if (error.code === 404) {
      return { changed: false, etag: null, updated: null };
    }
    console.error(`[GCS] Error checking webhooks metadata for ${slug}:`, error);
    return { changed: false, etag: null, updated: null };
  }
}

/**
 * Get webhooks from storage (Google Cloud Storage)
 * slug is used as the project ID
 */
export async function getWebhooks(
  slug: string,
  knownEtag?: string | null,
): Promise<{ data: WebhookHistory | null; etag: string | null }> {
  const key = `projects/${slug}/webhooks.json`;

  console.log(`[GCS] getWebhooks called for project: ${slug}`);

  try {
    const bucket = await getBucket();
    const file = bucket.file(key);

    console.log(`[GCS] Downloading file: ${key}`);
    const [contents] = await file.download();
    const data = JSON.parse(contents.toString('utf-8')) as WebhookHistory;

    // Migrate: ensure all webhooks have direction field (default to 'incoming' for legacy webhooks)
    if (data.webhooks) {
      data.webhooks = data.webhooks.map((webhook) => ({
        ...webhook,
        direction: webhook.direction || 'incoming',
      }));
    }

    console.log(
      `[GCS] Retrieved ${data.webhooks?.length || 0} webhooks from ${key}`,
    );

    // Get metadata for etag if not provided
    let etag = knownEtag || null;
    if (!etag) {
      console.log(`[GCS] Getting metadata for: ${key}`);
      const [metadata] = await file.getMetadata();
      etag = metadata.etag || null;
    }

    return { data, etag };
  } catch (error: any) {
    // Return null data if GCS operation fails (e.g., during build or file not found)
    if (error.code !== 404) {
      console.error(`[GCS] Error getting webhooks for ${slug}:`, error);
    } else {
      console.log(`[GCS] File does not exist: ${key}`);
    }
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
  console.log(
    `[GCS] saveWebhooks called for project: ${slug}, saving ${trimmedWebhooks.length} webhooks`,
  );

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
