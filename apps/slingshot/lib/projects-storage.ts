import { getBucket, isGcsUnavailableError } from './gcs-client';
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
    const bucket = await getBucket();
    const file = bucket.file('project_mappings.json');

    const [exists] = await file.exists();
    if (!exists) {
      return {};
    }

    const [contents] = await file.download();
    const data = JSON.parse(contents.toString('utf-8')) as ProjectMapping;
    return data;
  } catch {
    // Return empty mappings if GCS operation fails (e.g., during build)
    return {};
  }
}

/**
 * Save project mappings to storage
 */
export async function saveProjectMappings(
  mappings: ProjectMapping,
): Promise<void> {
  const bucket = await getBucket();
  const file = bucket.file('project_mappings.json');

  await file.save(JSON.stringify(mappings), {
    contentType: 'application/json',
    metadata: {
      cacheControl: 'no-cache',
    },
  });
}

/**
 * Check if project exists by slug (slug is the ID)
 */
export async function projectExists(slug: string): Promise<boolean> {
  const mappings = await getProjectMappings();
  return !!mappings[slug];
}

/**
 * Create a new project (slug is the ID)
 */
export async function createProject(slug: string): Promise<{ slug: string }> {
  const mappings = await getProjectMappings();

  if (mappings[slug]) {
    throw new Error('Slug already exists');
  }

  mappings[slug] = {
    slug,
    createdAt: Date.now(),
  };

  await saveProjectMappings(mappings);

  // Update global project count (may fail silently if GCS unavailable)
  try {
    await updateProjectCount(Object.keys(mappings).length);
  } catch (error) {
    if (!isGcsUnavailableError(error)) {
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
  const mappings = await getProjectMappings();
  const project = mappings[slug];

  if (!project) {
    return null;
  }

  return {
    slug,
    createdAt: project.createdAt,
  };
}

/**
 * Get all projects as a list
 * Pins "slingshot" to the top, sorts the rest alphabetically
 */
export async function getAllProjects(): Promise<
  Array<{ slug: string; createdAt: number }>
> {
  const mappings = await getProjectMappings();
  const projects = Object.entries(mappings).map(([slug, project]) => ({
    slug,
    createdAt: project.createdAt,
  }));

  // Separate slingshot from other projects
  const slingshot = projects.find((p) => p.slug === 'slingshot');
  const otherProjects = projects.filter((p) => p.slug !== 'slingshot');

  // Sort other projects alphabetically by slug
  otherProjects.sort((a, b) => a.slug.localeCompare(b.slug));

  // Combine: slingshot first, then alphabetically sorted rest
  const sortedProjects = slingshot
    ? [slingshot, ...otherProjects]
    : otherProjects;

  // Sync project count in stats (may fail silently if GCS unavailable)
  try {
    await updateProjectCount(sortedProjects.length);
  } catch (error) {
    if (!isGcsUnavailableError(error)) {
      throw error;
    }
  }

  return sortedProjects;
}

/**
 * Delete a project by slug
 */
export async function deleteProject(slug: string): Promise<void> {
  const mappings = await getProjectMappings();

  if (!mappings[slug]) {
    throw new Error('Project not found');
  }

  // Don't allow deleting the default project
  if (slug === 'slingshot') {
    throw new Error('Cannot delete the default project');
  }

  delete mappings[slug];
  await saveProjectMappings(mappings);

  // Update global project count (may fail silently if GCS unavailable)
  try {
    await updateProjectCount(Object.keys(mappings).length);
  } catch (error) {
    if (!isGcsUnavailableError(error)) {
      throw error;
    }
  }
}

/**
 * Ensure default project exists
 * During build/prerender, if GCS write fails, just return the slug
 */
export async function ensureDefaultProject(): Promise<{ slug: string }> {
  const mappings = await getProjectMappings();
  const defaultSlug = 'slingshot';

  if (mappings[defaultSlug]) {
    return { slug: defaultSlug };
  }

  // Try to create default project, but if it fails (e.g., during build), just return the slug
  try {
    return await createProject(defaultSlug);
  } catch {
    // If GCS operation fails (e.g., during build/prerender), just return the slug
    // The project will be created at runtime when GCS is available
    return { slug: defaultSlug };
  }
}
