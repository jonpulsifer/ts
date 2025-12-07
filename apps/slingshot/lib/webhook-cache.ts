/**
 * Optimized local-first cache for webhook data
 * Uses stale-while-revalidate pattern for instant UI with background refresh
 */

import type { Webhook } from './types';

const CACHE_PREFIX = 'slingshot_webhooks_';
const CACHE_MAX_AGE = 30 * 60 * 1000; // 30 minutes (increased from 5)
const CACHE_STALE_AGE = 5 * 60 * 1000; // 5 minutes - data is stale but usable

interface CachedWebhooks {
  webhooks: Webhook[];
  etag?: string;
  maxSize?: number;
  timestamp: number; // Single timestamp, no redundant storage
}

/**
 * Get cached webhooks entry (single key lookup)
 * Returns null if cache doesn't exist or is invalid
 */
export function getCachedWebhooksEntry(
  projectSlug: string,
): (CachedWebhooks & { stale: boolean }) | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cacheKey = `${CACHE_PREFIX}${projectSlug}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const data: CachedWebhooks = JSON.parse(cached);
    const age = Date.now() - data.timestamp;
    const stale = age > CACHE_STALE_AGE;

    // If cache is too old, return null to force refresh
    if (age > CACHE_MAX_AGE) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return { ...data, stale };
  } catch (error) {
    console.error('Failed to read webhook cache:', error);
    // Clean up corrupted cache
    try {
      const cacheKey = `${CACHE_PREFIX}${projectSlug}`;
      localStorage.removeItem(cacheKey);
    } catch {
      // Ignore cleanup errors
    }
    return null;
  }
}

/**
 * Get cached webhooks (simplified API)
 */
export function getCachedWebhooks(projectSlug: string): Webhook[] | null {
  const entry = getCachedWebhooksEntry(projectSlug);
  return entry?.webhooks || null;
}

/**
 * Get cached etag
 */
export function getCachedEtag(projectSlug: string): string | null {
  const entry = getCachedWebhooksEntry(projectSlug);
  return entry?.etag || null;
}

/**
 * Set cached webhooks (single key write)
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
    const data: CachedWebhooks = {
      webhooks,
      etag,
      maxSize,
      timestamp: Date.now(),
    };

    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    // Handle quota exceeded errors gracefully
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old cache entries');
      clearOldCacheEntries();
      // Try once more
      try {
        const cacheKey = `${CACHE_PREFIX}${projectSlug}`;
        const data: CachedWebhooks = {
          webhooks,
          etag,
          maxSize,
          timestamp: Date.now(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (retryError) {
        console.error('Failed to cache webhooks after cleanup:', retryError);
      }
    } else {
      console.error('Failed to cache webhooks:', error);
    }
  }
}

/**
 * Update cached webhooks optimistically
 * Used for immediate UI updates before server confirmation
 */
export function updateCachedWebhooks(
  projectSlug: string,
  updater: (webhooks: Webhook[]) => Webhook[],
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const entry = getCachedWebhooksEntry(projectSlug);
  if (entry) {
    const updated = updater(entry.webhooks);
    setCachedWebhooks(projectSlug, updated, entry.etag, entry.maxSize);
  }
}

/**
 * Add webhook optimistically to cache
 */
export function addWebhookToCache(projectSlug: string, webhook: Webhook): void {
  updateCachedWebhooks(projectSlug, (webhooks) => {
    // Add to beginning (newest first)
    return [webhook, ...webhooks];
  });
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
    localStorage.removeItem(cacheKey);
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

    // Find all cache keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const data: CachedWebhooks = JSON.parse(cached);
            if (now - data.timestamp > CACHE_MAX_AGE) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Corrupted entry, remove it
          keysToRemove.push(key);
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
 * Get all cache entries with details (for debugging/admin)
 */
export function getAllCacheEntries(): {
  slug: string;
  timestamp: number;
  count: number;
  size: number;
  stale: boolean;
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
      stale: boolean;
    }[] = [];

    // Find all cache keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        try {
          const slug = key.replace(CACHE_PREFIX, '');
          const cached = localStorage.getItem(key);
          if (cached) {
            const data: CachedWebhooks = JSON.parse(cached);
            const age = Date.now() - data.timestamp;
            entries.push({
              slug,
              timestamp: data.timestamp,
              count: data.webhooks.length,
              size: cached.length,
              stale: age > CACHE_STALE_AGE,
            });
          }
        } catch {
          // Skip corrupted entries
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
      if (key?.startsWith(CACHE_PREFIX)) {
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
