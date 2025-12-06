/**
 * @deprecated Use lib/projects-storage.ts instead
 * This file is kept for backwards compatibility but delegates to the new storage layer
 */
export {
  createProject,
  deleteProject,
  ensureDefaultProject,
  getAllProjects,
  getProjectBySlug,
  type ProjectMapping,
  projectExists,
} from './projects-storage';
