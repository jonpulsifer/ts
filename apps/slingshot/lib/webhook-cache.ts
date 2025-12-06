/**
 * LocalStorage cache for webhook data to reduce GCS storage quota usage
 */

import type { Webhook } from './types';

const CACHE_PREFIX = 'slingshot_webhooks_';
const CACHE_TIMESTAMP_PREFIX = 'slingshot_webhooks_ts_';
const CACHE_ETAG_PREFIX = 'slingshot_webhooks_etag_';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

interface CachedWebhooks {
  webhooks: Webhook[];
  timestamp: number;
  etag?: string;
  maxSize?: number;
}

/**
 * Get cached webhooks for a project
 */
export function getCachedWebhooks(projectSlug: string): Webhook[] | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cacheKey = `${CACHE_PREFIX}${projectSlug}`;
    const timestampKey = `${CACHE_TIMESTAMP_PREFIX}${projectSlug}`;

    const cached = localStorage.getItem(cacheKey);
    const timestampStr = localStorage.getItem(timestampKey);

    if (!cached || !timestampStr) {
      return null;
    }

    const timestamp = Number.parseInt(timestampStr, 10);
    const now = Date.now();

    // Check if cache is expired
    if (now - timestamp > CACHE_MAX_AGE) {
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(timestampKey);
      return null;
    }

    const data: CachedWebhooks = JSON.parse(cached);
    return data.webhooks;
  } catch (error) {
    console.error('Failed to read webhook cache:', error);
    return null;
  }
}

/**
 * Get full cache entry (including etag) without clearing on expiry.
 * Consumers can decide whether to treat stale data as a soft-hit for instant UI.
 */
export function getCachedWebhooksEntry(
  projectSlug: string,
): (CachedWebhooks & { stale: boolean }) | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cacheKey = `${CACHE_PREFIX}${projectSlug}`;
    const timestampKey = `${CACHE_TIMESTAMP_PREFIX}${projectSlug}`;
    const cached = localStorage.getItem(cacheKey);
    const timestampStr = localStorage.getItem(timestampKey);

    if (!cached || !timestampStr) {
      return null;
    }

    const timestamp = Number.parseInt(timestampStr, 10);
    const data: CachedWebhooks = JSON.parse(cached);
    const stale = Date.now() - timestamp > CACHE_MAX_AGE;

    return { ...data, stale };
  } catch (error) {
    console.error('Failed to read webhook cache entry:', error);
    return null;
  }
}

/**
 * Set cached webhooks for a project
 */
export function setCachedWebhooks(
  projectSlug: string,
  webhooks: Webhook[],
  etag?: string,
  maxSize?: number,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const cacheKey = `${CACHE_PREFIX}${projectSlug}`;
    const timestampKey = `${CACHE_TIMESTAMP_PREFIX}${projectSlug}`;
    const etagKey = `${CACHE_ETAG_PREFIX}${projectSlug}`;

    const data: CachedWebhooks = {
      webhooks,
      timestamp: Date.now(),
      etag,
      maxSize,
    };

    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(timestampKey, Date.now().toString());
    if (etag) {
      localStorage.setItem(etagKey, etag);
    }
  } catch (error) {
    // Handle quota exceeded errors gracefully
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old cache entries');
      clearOldCacheEntries();
      // Try once more
      try {
        const cacheKey = `${CACHE_PREFIX}${projectSlug}`;
        const timestampKey = `${CACHE_TIMESTAMP_PREFIX}${projectSlug}`;
        const etagKey = `${CACHE_ETAG_PREFIX}${projectSlug}`;
        const data: CachedWebhooks = {
          webhooks,
          timestamp: Date.now(),
          etag,
          maxSize,
        };
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(timestampKey, Date.now().toString());
        if (etag) {
          localStorage.setItem(etagKey, etag);
        }
      } catch (retryError) {
        console.error('Failed to cache webhooks after cleanup:', retryError);
      }
    } else {
      console.error('Failed to cache webhooks:', error);
    }
  }
}

/**
 * Get cached etag for a project
 */
export function getCachedEtag(projectSlug: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const etagKey = `${CACHE_ETAG_PREFIX}${projectSlug}`;
    return localStorage.getItem(etagKey);
  } catch (_error) {
    return null;
  }
}

/**
 * Clear cached webhooks for a project
 */
export function clearCachedWebhooks(projectSlug: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const cacheKey = `${CACHE_PREFIX}${projectSlug}`;
    const timestampKey = `${CACHE_TIMESTAMP_PREFIX}${projectSlug}`;
    const etagKey = `${CACHE_ETAG_PREFIX}${projectSlug}`;
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(timestampKey);
    localStorage.removeItem(etagKey);
  } catch (error) {
    console.error('Failed to clear webhook cache:', error);
  }
}

/**
 * Clear old cache entries to free up space
 */
function clearOldCacheEntries(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const now = Date.now();
    const keysToRemove: string[] = [];

    // Find all cache timestamp keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_TIMESTAMP_PREFIX)) {
        const timestampStr = localStorage.getItem(key);
        if (timestampStr) {
          const timestamp = Number.parseInt(timestampStr, 10);
          if (now - timestamp > CACHE_MAX_AGE) {
            keysToRemove.push(key);
            // Also remove the corresponding cache key
            const projectSlug = key.replace(CACHE_TIMESTAMP_PREFIX, '');
            keysToRemove.push(`${CACHE_PREFIX}${projectSlug}`);
          }
        }
      }
    }

    // Remove expired entries
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear old cache entries:', error);
  }
}

/**
 * Update cached webhooks by adding a new webhook or updating existing ones
 */
export function updateCachedWebhooks(
  projectSlug: string,
  updater: (webhooks: Webhook[]) => Webhook[],
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const cached = getCachedWebhooks(projectSlug);
  if (cached) {
    const updated = updater(cached);
    setCachedWebhooks(projectSlug, updated);
  }
}

/**
 * Get all cache entries with details
 */
export function getAllCacheEntries(): {
  slug: string;
  timestamp: number;
  count: number;
  size: number;
}[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const entries: {
      slug: string;
      timestamp: number;
      count: number;
      size: number;
    }[] = [];

    // Find all cache keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        const slug = key.replace(CACHE_PREFIX, '');
        const cachedStr = localStorage.getItem(key);
        const timestampStr = localStorage.getItem(
          `${CACHE_TIMESTAMP_PREFIX}${slug}`,
        );

        if (cachedStr && timestampStr) {
          const timestamp = Number.parseInt(timestampStr, 10);
          const data: CachedWebhooks = JSON.parse(cachedStr);

          entries.push({
            slug,
            timestamp,
            count: data.webhooks.length,
            size: cachedStr.length,
          });
        }
      }
    }

    return entries.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to get all cache entries:', error);
    return [];
  }
}

/**
 * Clear all cached webhooks for all projects
 */
export function clearAllCachedWebhooks(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const keysToRemove: string[] = [];

    // Find all cache-related keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key?.startsWith(CACHE_PREFIX) ||
        key?.startsWith(CACHE_TIMESTAMP_PREFIX) ||
        key?.startsWith(CACHE_ETAG_PREFIX)
      ) {
        keysToRemove.push(key);
      }
    }

    // Remove all cache entries
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
    console.log(`[Cache] Cleared ${keysToRemove.length} cache entries`);
  } catch (error) {
    console.error('Failed to clear all cached webhooks:', error);
    throw error;
  }
}
