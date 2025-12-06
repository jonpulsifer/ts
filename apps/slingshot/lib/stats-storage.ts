import { getBucket, isGcsUnavailableError } from './gcs-client';

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

// Debouncing mechanism to reduce GCS write frequency
let pendingStats: StatsData | null = null;
let saveTimeout: NodeJS.Timeout | null = null;
let isSaving = false;
const SAVE_DEBOUNCE_MS = 30000; // Save at most once every 30 seconds
const MAX_PENDING_UPDATES = 10; // Or after 10 updates, whichever comes first
let pendingUpdateCount = 0;

/**
 * Get stats from storage
 * Returns default stats if GCS operation fails
 */
export async function getStats(): Promise<StatsData> {
  console.log('[GCS] getStats called');
  try {
    const bucket = await getBucket();
    const file = bucket.file('stats.json');

    console.log('[GCS] Checking if stats.json exists');
    const [exists] = await file.exists();
    if (!exists) {
      console.log('[GCS] stats.json does not exist, returning default stats');
      return DEFAULT_STATS;
    }

    console.log('[GCS] Downloading stats.json');
    const [contents] = await file.download();
    const data = JSON.parse(contents.toString('utf-8')) as StatsData;
    console.log(`[GCS] Retrieved stats for ${Object.keys(data.projects).length} projects`);
    return data;
  } catch (error) {
    // Return default stats if GCS operation fails (e.g., during build)
    console.error('[GCS] Error getting stats:', error);
    return DEFAULT_STATS;
  }
}

/**
 * Save stats to storage (internal, immediate save)
 * Silently fails if GCS is unavailable (non-critical operation)
 */
async function saveStatsImmediate(stats: StatsData): Promise<void> {
  console.log(`[GCS] saveStatsImmediate called (${Object.keys(stats.projects).length} projects)`);
  try {
    const bucket = await getBucket();
    const file = bucket.file('stats.json');

    console.log('[GCS] Saving stats.json');
    await file.save(JSON.stringify(stats), {
      contentType: 'application/json',
      metadata: {
        cacheControl: 'no-cache',
      },
    });
    console.log('[GCS] Successfully saved stats.json');
  } catch (error) {
    // Silently fail - stats are not critical
    console.error('[GCS] Error saving stats (non-critical):', error);
  }
}

/**
 * Save stats to storage with debouncing
 * Batches multiple updates to reduce GCS write frequency
 * Silently fails if GCS is unavailable (non-critical operation)
 */
export async function saveStats(stats: StatsData): Promise<void> {
  // Store the latest stats
  pendingStats = stats;
  pendingUpdateCount++;

  // If we've accumulated enough updates, save immediately
  if (pendingUpdateCount >= MAX_PENDING_UPDATES) {
    console.log(`[GCS] saveStats: ${pendingUpdateCount} pending updates, saving immediately`);
    await flushPendingStats();
    return;
  }

  // Otherwise, debounce the save
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    await flushPendingStats();
  }, SAVE_DEBOUNCE_MS);

  console.log(`[GCS] saveStats: Debounced (${pendingUpdateCount} pending updates, will save in ${SAVE_DEBOUNCE_MS}ms)`);
}

/**
 * Flush pending stats to GCS immediately
 */
async function flushPendingStats(): Promise<void> {
  if (isSaving || !pendingStats) {
    return;
  }

  isSaving = true;
  const statsToSave = pendingStats;
  pendingStats = null;
  pendingUpdateCount = 0;

  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }

  try {
    await saveStatsImmediate(statsToSave);
  } finally {
    isSaving = false;
  }
}

/**
 * Force flush pending stats (for critical operations like project deletion)
 */
export async function flushStats(): Promise<void> {
  await flushPendingStats();
}

/**
 * Update project stats when a webhook is added
 */
export async function incrementWebhookCount(
  slug: string,
  timestamp: number,
): Promise<void> {
  console.log(`[GCS] incrementWebhookCount called for project: ${slug}`);
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
  console.log(`[GCS] resetProjectStats called for project: ${slug}`);
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
    // Flush immediately for critical operations
    await flushStats();
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
    // Flush immediately for critical operations like project creation/deletion
    await flushStats();
  } catch (error) {
    // Silently fail if GCS unavailable - stats are not critical
    if (!isGcsUnavailableError(error)) {
      throw error;
    }
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
