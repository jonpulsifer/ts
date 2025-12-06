import { head, put } from '@vercel/blob';

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
 * Get stats from storage
 */
export async function getStats(): Promise<StatsData> {
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
    // Handle blob not found errors - return default stats
    if (
      error?.status === 404 ||
      error?.statusCode === 404 ||
      error?.message?.includes('404') ||
      error?.message?.includes('not found') ||
      error?.message?.includes('does not exist') ||
      error?.message?.includes('BlobNotFoundError') ||
      error?.name === 'BlobNotFoundError'
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

/**
 * Save stats to storage
 */
export async function saveStats(stats: StatsData): Promise<void> {
  await put('stats.json', JSON.stringify(stats), {
    access: 'public',
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
  });
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
