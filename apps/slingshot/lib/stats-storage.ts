import { getBucket } from './gcs-client';

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
    const bucket = await getBucket();
    const file = bucket.file('stats.json');

    const [exists] = await file.exists();
    if (!exists) {
      return {
        projects: {},
        global: {
          totalProjects: 0,
          totalWebhooks: 0,
          updatedAt: Date.now(),
        },
      };
    }

    const [contents] = await file.download();
    const data = JSON.parse(contents.toString('utf-8')) as StatsData;
    return data;
  } catch (error: any) {
    // Handle file not found errors - return default stats
    if (
      error?.code === 404 ||
      error?.statusCode === 404 ||
      error?.message?.includes('404') ||
      error?.message?.includes('not found') ||
      error?.message?.includes('does not exist')
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
    // Handle auth/permission errors - return default stats
    // This can happen during build when GCS auth isn't available
    if (
      error?.code === 401 ||
      error?.code === 403 ||
      error?.statusCode === 401 ||
      error?.statusCode === 403 ||
      error?.message?.includes('Permission') ||
      error?.message?.includes('access') ||
      error?.message?.includes('denied') ||
      error?.message?.includes('Anonymous caller')
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
  const bucket = await getBucket();
  const file = bucket.file('stats.json');

  await file.save(JSON.stringify(stats), {
    contentType: 'application/json',
    metadata: {
      cacheControl: 'no-cache',
    },
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
