import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { head, put } from '@vercel/blob';

const DATA_DIR = join(process.cwd(), '.data');
const STATS_FILE = join(DATA_DIR, 'stats.json');

/**
 * Check if we're in development mode (local file system)
 */
const isDevelopment =
  process.env.NODE_ENV === 'development' || !process.env.VERCEL;

export interface ProjectStats {
  webhookCount: number;
  lastWebhookTimestamp: number | null;
  updatedAt: number;
}

export interface GlobalStats {
  totalProjects: number;
  totalWebhooks: number;
  updatedAt: number;
}

export interface StatsData {
  projects: Record<string, ProjectStats>;
  global: GlobalStats;
}

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
 * Get stats from storage
 */
export async function getStats(): Promise<StatsData> {
  if (isDevelopment) {
    await ensureDataDir();

    try {
      const content = await fs.readFile(STATS_FILE, 'utf-8');
      return JSON.parse(content) as StatsData;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return {
          projects: {},
          global: {
            totalProjects: 0,
            totalWebhooks: 0,
            updatedAt: Date.now(),
          },
        };
      }
      throw error;
    }
  } else {
    // Production: Use Vercel Blob
    try {
      const blob = await head('stats.json');
      if (!blob) {
        return {
          projects: {},
          global: {
            totalProjects: 0,
            totalWebhooks: 0,
            updatedAt: Date.now(),
          },
        };
      }

      const response = await fetch(blob.url, {
        cache: 'no-store',
      });

      if (!response.ok) {
        return {
          projects: {},
          global: {
            totalProjects: 0,
            totalWebhooks: 0,
            updatedAt: Date.now(),
          },
        };
      }

      const data = await response.json();
      return data as StatsData;
    } catch (error: any) {
      if (
        error?.status === 404 ||
        error?.message?.includes('404') ||
        error?.message?.includes('not found') ||
        error?.message?.includes('BlobNotFoundError')
      ) {
        return {
          projects: {},
          global: {
            totalProjects: 0,
            totalWebhooks: 0,
            updatedAt: Date.now(),
          },
        };
      }
      throw error;
    }
  }
}

/**
 * Save stats to storage
 */
export async function saveStats(stats: StatsData): Promise<void> {
  if (isDevelopment) {
    await ensureDataDir();
    await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } else {
    await put('stats.json', JSON.stringify(stats), {
      access: 'public',
      addRandomSuffix: false,
      cacheControlMaxAge: 0,
    });
  }
}

/**
 * Update project stats when a webhook is added
 */
export async function incrementWebhookCount(
  slug: string,
  timestamp: number,
): Promise<void> {
  const stats = await getStats();

  if (!stats.projects[slug]) {
    stats.projects[slug] = {
      webhookCount: 0,
      lastWebhookTimestamp: null,
      updatedAt: Date.now(),
    };
  }

  stats.projects[slug].webhookCount += 1;
  stats.projects[slug].lastWebhookTimestamp = timestamp;
  stats.projects[slug].updatedAt = Date.now();

  stats.global.totalWebhooks += 1;
  stats.global.updatedAt = Date.now();

  await saveStats(stats);
}

/**
 * Reset project stats when webhooks are cleared
 */
export async function resetProjectStats(slug: string): Promise<void> {
  const stats = await getStats();

  if (stats.projects[slug]) {
    const oldCount = stats.projects[slug].webhookCount;
    stats.projects[slug] = {
      webhookCount: 0,
      lastWebhookTimestamp: null,
      updatedAt: Date.now(),
    };

    stats.global.totalWebhooks = Math.max(
      0,
      stats.global.totalWebhooks - oldCount,
    );
    stats.global.updatedAt = Date.now();

    await saveStats(stats);
  }
}

/**
 * Update global project count
 */
export async function updateProjectCount(count: number): Promise<void> {
  const stats = await getStats();
  stats.global.totalProjects = count;
  stats.global.updatedAt = Date.now();
  await saveStats(stats);
}

/**
 * Get project stats
 */
export async function getProjectStats(
  slug: string,
): Promise<ProjectStats | null> {
  const stats = await getStats();
  return stats.projects[slug] || null;
}

/**
 * Get global stats
 */
export async function getGlobalStats(): Promise<GlobalStats> {
  const stats = await getStats();
  return stats.global;
}

/**
 * Sync stats from actual webhook data (for migration/correction)
 */
