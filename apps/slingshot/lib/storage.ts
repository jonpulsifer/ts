import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { del, head, put } from '@vercel/blob';
import { resetProjectStats } from './stats-storage';
import type { Webhook, WebhookHistory } from './types';

const MAX_WEBHOOKS = 100;
const DATA_DIR = join(process.cwd(), '.data');

/**
 * Check if we're in development mode (local file system)
 */
const isDevelopment =
  process.env.NODE_ENV === 'development' || !process.env.VERCEL;

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  if (isDevelopment) {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (_error) {
      // Directory might already exist
    }
  }
}

/**
 * Get the file path for a project's webhooks (slug is the ID)
 */
function getWebhookFilePath(slug: string): string {
  return join(DATA_DIR, 'projects', `${slug}`, 'webhooks.json');
}

/**
 * Get webhooks from storage (local file or Vercel Blob)
 * slug is used as the project ID
 */
export async function getWebhooks(
  slug: string,
): Promise<{ data: WebhookHistory | null; etag: string | null }> {
  if (isDevelopment) {
    await ensureDataDir();
    const filePath = getWebhookFilePath(slug);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content) as WebhookHistory;

      // Migrate: ensure all webhooks have direction field (default to 'incoming' for legacy webhooks)
      if (data?.webhooks) {
        data.webhooks = data.webhooks.map((webhook) => ({
          ...webhook,
          direction: webhook.direction || 'incoming',
        }));
      }

      // Get file stats for a simple "etag" (mtime)
      const stats = await fs.stat(filePath);
      const etag = stats.mtimeMs.toString();

      return { data, etag };
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return { data: null, etag: null };
      }
      throw error;
    }
  } else {
    // Production: Use Vercel Blob
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
      if (
        error?.status === 404 ||
        error?.message?.includes('404') ||
        error?.message?.includes('not found') ||
        error?.message?.includes('BlobNotFoundError')
      ) {
        return { data: null, etag: null };
      }
      throw error;
    }
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

  if (isDevelopment) {
    await ensureDataDir();
    const filePath = getWebhookFilePath(slug);

    // Ensure parent directory exists
    await fs.mkdir(join(filePath, '..'), { recursive: true });

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

    // Return mtime as etag
    const stats = await fs.stat(filePath);
    return stats.mtimeMs.toString();
  }
  // Production: Use Vercel Blob
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
  if (isDevelopment) {
    const filePath = getWebhookFilePath(slug);
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  } else {
    const key = `projects/${slug}/webhooks.json`;
    await del(key);
  }

  // Reset stats for this project
  await resetProjectStats(slug);
}
