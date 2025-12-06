/**
 * Simple in-memory rate limiter for 5 requests per second
 * Uses a sliding window approach
 *
 * Note: This is per-instance. For distributed rate limiting,
 * consider using Vercel Edge Config or Vercel KV in production.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 60000; // Clean up old entries every minute
const MAX_REQUESTS = 5;
const WINDOW_MS = 1000; // 1 second window

// Cleanup old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      // Remove timestamps older than the window
      entry.timestamps = entry.timestamps.filter(
        (ts) => now - ts < WINDOW_MS * 2,
      );
      // Remove empty entries
      if (entry.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., project ID or IP)
 * @returns Rate limit result
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier) || { timestamps: [] };

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    // Rate limited
    const oldestTimestamp = entry.timestamps[0];
    const reset = oldestTimestamp + WINDOW_MS;
    rateLimitStore.set(identifier, entry);
    return {
      success: false,
      limit: MAX_REQUESTS,
      remaining: 0,
      reset,
    };
  }

  // Allow request
  entry.timestamps.push(now);
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    limit: MAX_REQUESTS,
    remaining: MAX_REQUESTS - entry.timestamps.length,
    reset: now + WINDOW_MS,
  };
}
