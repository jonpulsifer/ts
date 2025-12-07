'use client';

import { Plus, Trash2, Webhook } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react';
import { toast } from 'sonner';
import { deleteProjectAction, getAllProjectsAction } from '@/lib/actions';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { clearCachedWebhooks } from '@/lib/webhook-cache';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from './ui/sidebar';

interface ProjectsListClientProps {
  initialProjects: Project[];
}

export function ProjectsListClient({
  initialProjects,
}: ProjectsListClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const [isPending, startTransition] = useTransition();

  type OptimisticAction =
    | { action: 'delete'; slug: string }
    | { action: 'add'; project: Project }
    | Project[];

  const [optimisticProjects, setOptimisticProjects] = useOptimistic(
    initialProjects,
    (state: Project[], action: OptimisticAction): Project[] => {
      if (Array.isArray(action)) {
        return action;
      }

      if ('action' in action && action.action === 'delete') {
        return state.filter((p) => p.slug !== action.slug);
      }

      const projectToAdd =
        'action' in action && action.action === 'add'
          ? action.project
          : (action as Project);

      const exists = state.some((p) => p.slug === projectToAdd.slug);
      if (exists) {
        return state;
      }

      const newState = [...state, projectToAdd];
      const slingshot = newState.find((p) => p.slug === 'slingshot');
      const others = newState
        .filter((p) => p.slug !== 'slingshot')
        .sort((a, b) => a.slug.localeCompare(b.slug));
      return slingshot ? [slingshot, ...others] : others;
    },
  );

  const prevProjectsRef = useRef(initialProjects);

  useEffect(() => {
    const prevProjects = prevProjectsRef.current;
    const projectsChanged =
      initialProjects.length !== prevProjects.length ||
      initialProjects.some(
        (p, i) =>
          prevProjects[i]?.slug !== p.slug ||
          prevProjects[i]?.createdAt !== p.createdAt,
      );

    if (projectsChanged) {
      prevProjectsRef.current = initialProjects;
      startTransition(() => {
        setOptimisticProjects(initialProjects);
      });
    }
  }, [initialProjects, setOptimisticProjects, startTransition]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const currentSlug =
    pathname === '/'
      ? null
      : pathname.startsWith('/') &&
          pathname !== '/health' &&
          !pathname.startsWith('/api') &&
          !pathname.startsWith('/projects') &&
          !pathname.startsWith('/request-headers') &&
          !pathname.startsWith('/environment') &&
          !pathname.startsWith('/jwt-decoder') &&
          !pathname.startsWith('/gcp') &&
          !pathname.startsWith('/cache')
        ? pathname.split('/')[1]
        : null;

  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    if (project.slug === 'slingshot') {
      toast.error('Cannot delete the default webhook project');
      return;
    }
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    const slugToDelete = projectToDelete.slug;

    startTransition(() => {
      setOptimisticProjects({ action: 'delete', slug: slugToDelete });
    });

    setDeleteDialogOpen(false);
    setProjectToDelete(null);

    try {
      await deleteProjectAction(slugToDelete);
      clearCachedWebhooks(slugToDelete);
      toast.success(`Webhook project "${slugToDelete}" deleted`);

      if (currentSlug === slugToDelete) {
        router.push('/');
      }

      const { projects: freshProjects } = await getAllProjectsAction();
      setOptimisticProjects(freshProjects);
    } catch (error: any) {
      const { projects: freshProjects } = await getAllProjectsAction();
      setOptimisticProjects(freshProjects);
      toast.error(error.message || 'Failed to delete project');
    }
  };

  const isCollapsed = state === 'collapsed';

  return (
    <>
      <SidebarMenu>
        {optimisticProjects.length === 0 ? (
          <SidebarMenuItem>
            {!isCollapsed && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                No projects yet
              </div>
            )}
          </SidebarMenuItem>
        ) : (
          <>
            {optimisticProjects.map((project) => {
              const isActive = currentSlug === project.slug;
              const canDelete = project.slug !== 'slingshot';
              return (
                <SidebarMenuItem key={project.slug}>
                  <div className="group relative flex items-center w-full">
                    <SidebarMenuButton
                      asChild
                      tooltip={project.slug}
                      className={cn(
                        'transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex-1',
                        isActive &&
                          'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm',
                      )}
                    >
                      <a href={`/${project.slug}`}>
                        <Webhook className="size-4 shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="truncate">{project.slug}</span>
                            {project.slug === 'slingshot' && (
                              <Badge
                                variant="outline"
                                className="ml-auto text-[10px] px-1 py-0 h-4 border-primary/30 text-primary bg-primary/10"
                              >
                                Default
                              </Badge>
                            )}
                          </>
                        )}
                      </a>
                    </SidebarMenuButton>
                    {canDelete && !isCollapsed && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={cn(
                          'opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0',
                          'hover:bg-destructive/10 hover:text-destructive',
                        )}
                        onClick={(e) => handleDeleteClick(e, project)}
                        title={`Delete webhook project ${project.slug}`}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    )}
                  </div>
                </SidebarMenuItem>
              );
            })}
            {isCollapsed && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Create new webhook project"
                  className="transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Plus className="size-4" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </>
        )}
      </SidebarMenu>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the webhook project "
              {projectToDelete?.slug}"? This action cannot be undone. All
              webhook history for this project will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProjectToDelete(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isPending}
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
