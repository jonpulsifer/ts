'use client';

import { Activity, Home, Plus, Trash2, Webhook } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { deleteProjectAction } from '@/lib/actions';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  projects: Project[];
}

export function AppSidebar({ projects: initialProjects }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const [projects, _setProjects] = useState(initialProjects);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Refresh projects list periodically using router.refresh()
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const isHome = pathname === '/';
  const currentSlug =
    pathname === '/'
      ? null
      : pathname.startsWith('/') &&
          pathname !== '/health' &&
          !pathname.startsWith('/api') &&
          !pathname.startsWith('/projects')
        ? pathname.split('/')[1]
        : null;

  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    if (project.slug === 'slingshot') {
      toast.error('Cannot delete the default project');
      return;
    }
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProjectAction(projectToDelete.slug);
      toast.success(`Project "${projectToDelete.slug}" deleted`);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);

      // If we're on the deleted project's page, redirect home
      if (currentSlug === projectToDelete.slug) {
        router.push('/');
      }

      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
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
              tooltip="Slingshot - Webhook Playground"
            >
              <a href="/" className="group">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/50 transition-all group-hover:scale-105">
                  <Webhook className="size-5" />
                </div>
                {!isCollapsed && (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold">Slingshot</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Webhook Playground
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
          <div className="flex items-center justify-between px-2 py-1.5">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Navigation
              </SidebarGroupLabel>
            )}
            <SidebarTrigger className="ml-auto" />
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Home"
                className={cn(
                  'transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isHome &&
                    'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm',
                )}
              >
                <a href="/">
                  <Home className="size-4" />
                  {!isCollapsed && <span>Home</span>}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2 py-1.5">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Projects
              </SidebarGroupLabel>
            )}
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 ml-auto"
                onClick={() => router.push('/')}
                title="Create new project"
              >
                <Plus className="size-3" />
              </Button>
            )}
          </div>
          <SidebarMenu>
            {projects.length === 0 ? (
              <SidebarMenuItem>
                {!isCollapsed && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    No projects yet
                  </div>
                )}
              </SidebarMenuItem>
            ) : (
              <>
                {projects.map((project) => {
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
                            title={`Delete ${project.slug}`}
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
                      tooltip="Create new project"
                      onClick={() => router.push('/')}
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

        {!isCollapsed && projects.length > 0 && (
          <SidebarGroup className="mt-auto border-t border-sidebar-border pt-4">
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="size-3" />
                <span>
                  {projects.length}{' '}
                  {projects.length === 1 ? 'project' : 'projects'}
                </span>
              </div>
            </div>
          </SidebarGroup>
        )}
      </SidebarContent>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{projectToDelete?.slug}"? This
              action cannot be undone. All webhook history for this project will
              be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProjectToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
