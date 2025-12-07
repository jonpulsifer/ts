import {
  getFirestore,
  isFirestoreUnavailableError,
  shouldSkipFirestoreOperations,
} from './firestore-client';

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
 * Check if stats file has changed (using metadata only, no download)
 */
export async function checkStatsChanged(): Promise<{
  changed: boolean;
  etag: string | null;
  updated: number | null;
}> {
  if (shouldSkipFirestoreOperations()) {
    return { changed: false, etag: null, updated: null };
  }
  try {
    const firestore = await getFirestore();
    const metaDoc = await firestore.collection('slingshot').doc('_meta').get();
    if (!metaDoc.exists) {
      return { changed: false, etag: null, updated: null };
    }
    const data = metaDoc.data() || {};
    const updated =
      typeof data.updatedAt === 'number' ? data.updatedAt : Date.now();
    return { changed: true, etag: updated.toString(), updated };
  } catch (_error) {
    return { changed: false, etag: null, updated: null };
  }
}

/**
 * Get stats from storage
 * Returns default stats if GCS operation fails
 */
export async function getStats(
  knownEtag?: string | null,
): Promise<{ data: StatsData; etag: string | null }> {
  if (shouldSkipFirestoreOperations()) {
    return { data: DEFAULT_STATS, etag: null };
  }
  try {
    const firestore = await getFirestore();
    const metaDoc = await firestore.collection('slingshot').doc('_meta').get();
    const projectsSnap = await firestore
      .collection('slingshot')
      .where('type', '==', 'project')
      .get();

    const projects: Record<string, ProjectStats> = {};
    projectsSnap.docs.forEach((doc) => {
      const data = doc.data() || {};
      projects[doc.id] = {
        webhookCount: data.webhookCount || 0,
        lastWebhookTimestamp:
          typeof data.lastWebhookTimestamp === 'number'
            ? data.lastWebhookTimestamp
            : null,
        updatedAt: data.updatedAt || Date.now(),
      };
    });

    const metaData = metaDoc.data() || {};
    const global: GlobalStats = {
      totalProjects: metaData.totalProjects || projectsSnap.docs.length,
      totalWebhooks: metaData.totalWebhooks || 0,
      updatedAt: metaData.updatedAt || Date.now(),
    };

    const etag = knownEtag || global.updatedAt.toString();
    return { data: { projects, global }, etag };
  } catch (error) {
    if (isFirestoreUnavailableError(error)) {
      return { data: DEFAULT_STATS, etag: null };
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
  if (shouldSkipFirestoreOperations()) {
    return;
  }

  const firestore = await getFirestore();
  const projectRef = firestore.collection('slingshot').doc(slug);
  const metaRef = firestore.collection('slingshot').doc('_meta');

  await firestore.runTransaction(async (tx) => {
    // All reads must happen before any writes
    const projectSnap = await tx.get(projectRef);
    const metaSnap = await tx.get(metaRef);

    // Now perform all writes
    if (!projectSnap.exists) {
      tx.set(projectRef, {
        slug,
        createdAt: Date.now(),
        type: 'project',
        webhookCount: 0,
        lastWebhookTimestamp: null,
        updatedAt: Date.now(),
        webhooksUpdatedAt: Date.now(),
      });
    }

    const projectData = projectSnap.data() || {};
    const currentCount =
      typeof projectData.webhookCount === 'number'
        ? projectData.webhookCount
        : 0;

    tx.set(
      projectRef,
      {
        webhookCount: currentCount + 1,
        lastWebhookTimestamp: timestamp,
        updatedAt: Date.now(),
      },
      { merge: true },
    );

    const metaData = metaSnap.data() || {};
    const currentTotal =
      typeof metaData.totalWebhooks === 'number' ? metaData.totalWebhooks : 0;
    const currentProjects =
      typeof metaData.totalProjects === 'number'
        ? metaData.totalProjects
        : undefined;

    // Build update object, excluding undefined values
    const updateData: {
      totalWebhooks: number;
      totalProjects?: number;
      updatedAt: number;
      type: string;
    } = {
      totalWebhooks: currentTotal + 1,
      updatedAt: Date.now(),
      type: 'meta',
    };

    // Only include totalProjects if it has a valid value
    if (typeof currentProjects === 'number') {
      updateData.totalProjects = currentProjects;
    }

    tx.set(metaRef, updateData, { merge: true });
  });
}

/**
 * Reset project stats when webhooks are cleared
 */
export async function resetProjectStats(slug: string): Promise<void> {
  if (shouldSkipFirestoreOperations()) {
    return;
  }

  const firestore = await getFirestore();
  const projectRef = firestore.collection('slingshot').doc(slug);
  const metaRef = firestore.collection('slingshot').doc('_meta');

  await firestore.runTransaction(async (tx) => {
    const projectSnap = await tx.get(projectRef);
    const metaSnap = await tx.get(metaRef);
    const oldCount =
      (projectSnap.data() && projectSnap.data()!.webhookCount) || 0;

    tx.set(
      projectRef,
      {
        webhookCount: 0,
        lastWebhookTimestamp: null,
        updatedAt: Date.now(),
      },
      { merge: true },
    );

    const metaData = metaSnap.data() || {};
    const currentTotal =
      typeof metaData.totalWebhooks === 'number' ? metaData.totalWebhooks : 0;

    tx.set(
      metaRef,
      {
        totalWebhooks: Math.max(0, currentTotal - oldCount),
        updatedAt: Date.now(),
      },
      { merge: true },
    );
  });
}

/**
 * Update global project count
 * Silently fails if GCS is unavailable (non-critical operation)
 */
export async function updateProjectCount(count?: number): Promise<void> {
  if (shouldSkipFirestoreOperations()) {
    return;
  }

  const firestore = await getFirestore();
  const metaRef = firestore.collection('slingshot').doc('_meta');

  try {
    const total =
      typeof count === 'number'
        ? count
        : (
            await firestore
              .collection('slingshot')
              .where('type', '==', 'project')
              .get()
          ).docs.length;

    await metaRef.set(
      {
        totalProjects: total,
        updatedAt: Date.now(),
        type: 'meta',
      },
      { merge: true },
    );
  } catch (error) {
    if (!isFirestoreUnavailableError(error)) {
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
  const firestore = await getFirestore();
  const doc = await firestore.collection('slingshot').doc(slug).get();
  if (!doc.exists) return null;
  const data = doc.data() || {};
  return {
    webhookCount: data.webhookCount || 0,
    lastWebhookTimestamp:
      typeof data.lastWebhookTimestamp === 'number'
        ? data.lastWebhookTimestamp
        : null,
    updatedAt: data.updatedAt || Date.now(),
  };
}

/**
 * Remove project stats when a project is deleted
 */
export async function removeProjectStats(slug: string): Promise<void> {
  const firestore = await getFirestore();
  const metaRef = firestore.collection('slingshot').doc('_meta');
  const projectRef = firestore.collection('slingshot').doc(slug);

  await firestore.runTransaction(async (tx) => {
    const projectSnap = await tx.get(projectRef);
    const metaSnap = await tx.get(metaRef);
    const oldCount =
      (projectSnap.data() && projectSnap.data()!.webhookCount) || 0;

    tx.delete(projectRef);

    const metaData = metaSnap.data() || {};
    const currentTotal =
      typeof metaData.totalWebhooks === 'number' ? metaData.totalWebhooks : 0;
    const currentProjects =
      typeof metaData.totalProjects === 'number'
        ? metaData.totalProjects
        : undefined;

    // Build update object, excluding undefined values
    const updateData: {
      totalWebhooks: number;
      totalProjects?: number;
      updatedAt: number;
      type: string;
    } = {
      totalWebhooks: Math.max(0, currentTotal - oldCount),
      updatedAt: Date.now(),
      type: 'meta',
    };

    // Only include totalProjects if it has a valid value
    if (typeof currentProjects === 'number') {
      updateData.totalProjects = Math.max(0, currentProjects - 1);
    }

    tx.set(metaRef, updateData, { merge: true });
  });
}

/**
 * Get global stats
 */
export async function getGlobalStats(): Promise<GlobalStats> {
  const firestore = await getFirestore();
  const snap = await firestore.collection('slingshot').doc('_meta').get();
  const data = snap.data() || {};
  return {
    totalProjects: data.totalProjects || 0,
    totalWebhooks: data.totalWebhooks || 0,
    updatedAt: data.updatedAt || Date.now(),
  };
}
