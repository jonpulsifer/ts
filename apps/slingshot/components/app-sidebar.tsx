'use client';

import {
  BookOpen,
  Cloud,
  Database,
  Plus,
  Terminal,
  Trash2,
  Webhook,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useOptimistic, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { CreateProjectModal } from '@/components/create-project-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { deleteProjectAction, getAllProjectsAction } from '@/lib/actions';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { clearCachedWebhooks } from '@/lib/webhook-cache';

interface AppSidebarProps {
  projects: Project[];
}

export function AppSidebar({ projects: initialProjects }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const [isPending, startTransition] = useTransition();

  // Use optimistic updates for projects list
  type OptimisticAction =
    | { action: 'delete'; slug: string }
    | { action: 'add'; project: Project }
    | Project[]; // For syncing with server state

  const [optimisticProjects, setOptimisticProjects] = useOptimistic(
    initialProjects,
    (state: Project[], action: OptimisticAction): Project[] => {
      // Handle array sync (from server)
      if (Array.isArray(action)) {
        return action;
      }

      // Handle delete action
      if ('action' in action && action.action === 'delete') {
        return state.filter((p) => p.slug !== action.slug);
      }

      // Handle add action or direct project object
      const projectToAdd =
        'action' in action && action.action === 'add'
          ? action.project
          : (action as Project);

      // Check if already exists to avoid duplicates
      const exists = state.some((p) => p.slug === projectToAdd.slug);
      if (exists) {
        return state;
      }

      // Add new project and maintain sort order (slingshot first, then alphabetical)
      const newState = [...state, projectToAdd];
      const slingshot = newState.find((p) => p.slug === 'slingshot');
      const others = newState
        .filter((p) => p.slug !== 'slingshot')
        .sort((a, b) => a.slug.localeCompare(b.slug));
      return slingshot ? [slingshot, ...others] : others;
    },
  );

  // Sync optimistic state with server state when initialProjects changes
  useEffect(() => {
    startTransition(() => {
      setOptimisticProjects(initialProjects);
    });
  }, [initialProjects, setOptimisticProjects, startTransition]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const currentSlug =
    pathname === '/'
      ? null
      : pathname.startsWith('/') &&
          pathname !== '/health' &&
          !pathname.startsWith('/api') &&
          !pathname.startsWith('/projects') &&
          !pathname.startsWith('/request-headers') &&
          !pathname.startsWith('/environment') &&
          !pathname.startsWith('/gcp') &&
          !pathname.startsWith('/cache')
        ? pathname.split('/')[1]
        : null;

  const developerTools = [
    { name: 'Environment', url: '/environment', icon: Terminal },
    { name: 'Request Headers', url: '/request-headers', icon: BookOpen },
    { name: 'Google Cloud Storage', url: '/gcp', icon: Cloud },
    { name: 'Cache Management', url: '/cache', icon: Database },
  ];

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

    // Optimistically update UI
    startTransition(() => {
      setOptimisticProjects({ action: 'delete', slug: slugToDelete });
    });

    setDeleteDialogOpen(false);
    setProjectToDelete(null);

    try {
      await deleteProjectAction(slugToDelete);

      // Clear the cache for the deleted project
      clearCachedWebhooks(slugToDelete);

      toast.success(`Webhook project "${slugToDelete}" deleted`);

      // If we're on the deleted project's page, redirect home
      if (currentSlug === slugToDelete) {
        router.push('/');
      }

      // Fetch fresh projects list from server
      const { projects: freshProjects } = await getAllProjectsAction();
      setOptimisticProjects(freshProjects);
    } catch (error: any) {
      // Revert optimistic update on error
      const { projects: freshProjects } = await getAllProjectsAction();
      setOptimisticProjects(freshProjects);
      toast.error(error.message || 'Failed to delete project');
    }
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="Slingshot - Webhook Testing Platform"
              className={isCollapsed ? 'justify-center' : ''}
            >
              <a href="/" className="group">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-sm shadow-violet-500/20 transition-all group-hover:scale-105">
                  <Webhook className="size-5" />
                </div>
                {!isCollapsed && (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold">Slingshot</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Webhook Testing Platform
                    </span>
                  </div>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div
            className={cn(
              'flex items-center px-2 py-1.5',
              isCollapsed ? 'justify-center' : 'justify-between',
            )}
          >
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Navigation
              </SidebarGroupLabel>
            )}
            <SidebarTrigger className={isCollapsed ? '' : 'ml-auto'} />
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Quick Start"
                className={cn(
                  'transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  pathname === '/' &&
                    'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm',
                )}
              >
                <a href="/">
                  <BookOpen className="size-4" />
                  {!isCollapsed && <span>Quick Start</span>}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2 py-1.5">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Other Tools
              </SidebarGroupLabel>
            )}
          </div>
          <SidebarMenu>
            {developerTools.map((tool) => {
              const isActive =
                pathname === tool.url ||
                (tool.url !== '/' && pathname.startsWith(tool.url));
              return (
                <SidebarMenuItem key={tool.name}>
                  <SidebarMenuButton
                    asChild
                    tooltip={tool.name}
                    className={cn(
                      'transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive &&
                        'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm',
                    )}
                  >
                    <a href={tool.url}>
                      <tool.icon className="size-4" />
                      {!isCollapsed && <span>{tool.name}</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2 py-1.5">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                WEBHOOK PROJECTS ({optimisticProjects.length})
              </SidebarGroupLabel>
            )}
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 ml-auto"
                onClick={() => setCreateModalOpen(true)}
                title="Create new webhook project"
              >
                <Plus className="size-3" />
              </Button>
            )}
          </div>
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
                            size="sm"
                            className={cn(
                              'h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0',
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
                      onClick={() => setCreateModalOpen(true)}
                      className="transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <Plus className="size-4" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

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

      <CreateProjectModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </Sidebar>
  );
}
