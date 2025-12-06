import {
  getBucket,
  isGcsAuthError,
  isGcsNotFoundError,
  isGcsUnavailableError,
} from './gcs-client';

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

const DEFAULT_STATS: StatsData = {
  projects: {},
  global: {
    totalProjects: 0,
    totalWebhooks: 0,
    updatedAt: Date.now(),
  },
};

/**
 * Get stats from storage
 * Returns default stats if GCS is unavailable or file doesn't exist
 */
export async function getStats(): Promise<StatsData> {
  try {
    const bucket = await getBucket();
    const file = bucket.file('stats.json');

    const [exists] = await file.exists();
    if (!exists) {
      return DEFAULT_STATS;
    }

    const [contents] = await file.download();
    const data = JSON.parse(contents.toString('utf-8')) as StatsData;
    return data;
  } catch (error) {
    // Return default stats if GCS is unavailable, file not found, or auth errors
    if (
      isGcsUnavailableError(error) ||
      isGcsNotFoundError(error) ||
      isGcsAuthError(error)
    ) {
      return DEFAULT_STATS;
    }
    throw error;
  }
}

/**
 * Save stats to storage
 * Silently fails if GCS is unavailable (non-critical operation)
 */
export async function saveStats(stats: StatsData): Promise<void> {
  try {
    const bucket = await getBucket();
    const file = bucket.file('stats.json');

    await file.save(JSON.stringify(stats), {
      contentType: 'application/json',
      metadata: {
        cacheControl: 'no-cache',
      },
    });
  } catch (error) {
    // Silently fail if GCS unavailable - stats are not critical
    if (isGcsUnavailableError(error) || isGcsAuthError(error)) {
      return;
    }
    throw error;
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
 * Silently fails if GCS is unavailable (non-critical operation)
 */
export async function updateProjectCount(count: number): Promise<void> {
  try {
    const stats = await getStats();
    stats.global.totalProjects = count;
    stats.global.updatedAt = Date.now();
    await saveStats(stats);
  } catch (error) {
    // Silently fail if GCS unavailable - stats are not critical
    if (isGcsUnavailableError(error) || isGcsAuthError(error)) {
      return;
    }
    throw error;
  }
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
