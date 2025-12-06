import { head, put } from '@vercel/blob';
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
 */
export async function getProjectMappings(): Promise<ProjectMapping> {
  try {
    const blob = await head('project_mappings.json');
    if (!blob) {
      return {};
    }

    const response = await fetch(blob.url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    return data as ProjectMapping;
  } catch (error: any) {
    // Handle blob not found errors - return empty mappings
    if (
      error?.status === 404 ||
      error?.statusCode === 404 ||
      error?.message?.includes('404') ||
      error?.message?.includes('not found') ||
      error?.message?.includes('does not exist') ||
      error?.message?.includes('BlobNotFoundError') ||
      error?.name === 'BlobNotFoundError'
    ) {
      return {};
    }
    throw error;
  }
}

/**
 * Save project mappings to storage
 */
export async function saveProjectMappings(
  mappings: ProjectMapping,
): Promise<void> {
  await put('project_mappings.json', JSON.stringify(mappings), {
    access: 'public',
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
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

  // Update global project count
  await updateProjectCount(Object.keys(mappings).length);

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

  // Sync project count in stats
  await updateProjectCount(sortedProjects.length);

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

  // Update global project count
  await updateProjectCount(Object.keys(mappings).length);
}

/**
 * Ensure default project exists
 */
export async function ensureDefaultProject(): Promise<{ slug: string }> {
  const mappings = await getProjectMappings();
  const defaultSlug = 'slingshot';

  if (mappings[defaultSlug]) {
    return { slug: defaultSlug };
  }

  // Create default project
  return await createProject(defaultSlug);
}
