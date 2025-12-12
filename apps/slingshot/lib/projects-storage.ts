import { cacheTag } from 'next/cache';
import {
  FIRESTORE_COLLECTION_NAME,
  WEBHOOKS_SUBCOLLECTION_NAME,
} from './constants';
import { getFirestore, isFirestoreUnavailableError } from './firestore-client';
import { updateProjectCount } from './stats-storage';

/**
 * Simplified project storage - slug is the ID
 */
export interface ProjectMapping {
  [slug: string]: {
    slug: string;
    createdAt: number;
  };
}

/**
 * Get project mappings from storage
 * Returns empty object if GCS operation fails
 */
export async function getProjectMappings(): Promise<ProjectMapping> {
  try {
    const firestore = await getFirestore();
    const snapshot = await firestore
      .collection(FIRESTORE_COLLECTION_NAME)
      .where('type', '==', 'project')
      .get();

    const mappings: ProjectMapping = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      mappings[doc.id] = {
        slug: data.slug || doc.id,
        createdAt: data.createdAt || Date.now(),
      };
    });
    return mappings;
  } catch (error) {
    console.error('[Firestore] Error getting project mappings:', error);
    if (isFirestoreUnavailableError(error)) {
      return {};
    }
    throw error;
  }
}

/**
 * Check if project exists by slug (slug is the ID)
 */
export async function projectExists(slug: string): Promise<boolean> {
  const firestore = await getFirestore();
  const doc = await firestore.collection('slingshot').doc(slug).get();
  return doc.exists && (doc.data()?.type || 'project') === 'project';
}

/**
 * Create a new project (slug is the ID)
 */
/**
 * Invalidate projects cache by re-exporting with cache
 * This ensures fresh data after mutations
 */
export async function createProject(slug: string): Promise<{ slug: string }> {
  const firestore = await getFirestore();
  const docRef = firestore.collection('slingshot').doc(slug);
  const snap = await docRef.get();

  if (snap.exists) {
    throw new Error('Slug already exists');
  }

  await docRef.set({
    slug,
    createdAt: Date.now(),
    webhookCount: 0,
    lastWebhookTimestamp: null,
    updatedAt: Date.now(),
    webhooksUpdatedAt: Date.now(),
    type: 'project',
    maxSize: 100,
  });

  try {
    await updateProjectCount();
  } catch (error) {
    if (!isFirestoreUnavailableError(error)) {
      throw error;
    }
  }

  return { slug };
}

/**
 * Get project by slug (slug is the ID)
 */
export async function getProjectBySlug(
  slug: string,
): Promise<{ slug: string; createdAt: number } | null> {
  const firestore = await getFirestore();
  const doc = await firestore.collection('slingshot').doc(slug).get();
  if (!doc.exists || (doc.data()?.type || 'project') !== 'project') {
    return null;
  }
  const data = doc.data() || {};
  return {
    slug: data.slug || slug,
    createdAt: data.createdAt || Date.now(),
  };
}

/**
 * Get all projects as a list (internal, uncached)
 * Pins "slingshot" to the top, sorts the rest alphabetically
 */
async function _getAllProjectsUncached(): Promise<
  Array<{ slug: string; createdAt: number }>
> {
  const mappings = await getProjectMappings();
  const projects = Object.entries(mappings).map(([slug, project]) => ({
    slug,
    createdAt: project.createdAt,
  }));

  const slingshot = projects.find((p) => p.slug === 'slingshot');
  const otherProjects = projects.filter((p) => p.slug !== 'slingshot');
  otherProjects.sort((a, b) => a.slug.localeCompare(b.slug));

  const sortedProjects = slingshot
    ? [slingshot, ...otherProjects]
    : otherProjects;

  try {
    await updateProjectCount();
  } catch (error) {
    if (!isFirestoreUnavailableError(error)) {
      throw error;
    }
  }

  return sortedProjects;
}

/**
 * Get all projects as a list with cross-request caching.
 * - Caches using Cache Components so pre-rendered pages don't refetch on every
 *   render/navigation.
 * - Always returns at least the default project so static pages render a list.
 */
export async function getAllProjects(): Promise<
  Array<{ slug: string; createdAt: number }>
> {
  'use cache';
  cacheTag('projects');

  const projects = await _getAllProjectsUncached();

  if (!projects.length) {
    return [
      {
        slug: 'slingshot',
        createdAt: 0,
      },
    ];
  }

  return projects;
}

/**
 * Delete a project by slug
 */
export async function deleteProject(slug: string): Promise<void> {
  if (slug === 'slingshot') {
    throw new Error('Cannot delete the default project');
  }

  const firestore = await getFirestore();
  const docRef = firestore.collection('slingshot').doc(slug);
  const snap = await docRef.get();

  if (!snap.exists) {
    throw new Error('Project not found');
  }

  // Prevent deleting the final remaining project
  const mappings = await getProjectMappings();
  const totalProjects = Object.keys(mappings).length;
  if (totalProjects <= 1) {
    throw new Error('Cannot delete the last remaining project');
  }

  // Delete webhooks subcollection
  const webhooksSnap = await docRef
    .collection(WEBHOOKS_SUBCOLLECTION_NAME)
    .get();
  const batch = firestore.batch();
  for (const doc of webhooksSnap.docs) {
    batch.delete(doc.ref);
  }
  batch.delete(docRef);
  await batch.commit();

  try {
    await updateProjectCount();
    const { removeProjectStats } = await import('./stats-storage');
    await removeProjectStats(slug);
  } catch (error) {
    if (!isFirestoreUnavailableError(error)) {
      throw error;
    }
  }
}

/**
 * Ensure default project exists
 * During build/prerender, if GCS write fails, just return the slug
 */
export async function ensureDefaultProject(): Promise<{ slug: string }> {
  const defaultSlug = 'slingshot';
  const firestore = await getFirestore();
  const docRef = firestore.collection('slingshot').doc(defaultSlug);
  const snap = await docRef.get();

  if (snap.exists) {
    return { slug: defaultSlug };
  }

  try {
    return await createProject(defaultSlug);
  } catch (error) {
    if (isFirestoreUnavailableError(error)) {
      return { slug: defaultSlug };
    }
    throw error;
  }
}
