import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { getAllProjects } from '@/lib/projects-storage';
import { AppSidebar } from './app-sidebar';

async function ProjectsSidebarContent() {
  const projects = await getAllProjects();
  return <AppSidebar projects={projects} />;
}

function ProjectsSidebarSpinner() {
  return (
    <div className="flex flex-col h-full items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <div className="absolute inset-0 h-6 w-6 animate-spin text-primary/20">
            <Loader2 className="h-6 w-6" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function ProjectsSidebar() {
  return (
    <Suspense fallback={<ProjectsSidebarSpinner />}>
      <ProjectsSidebarContent />
    </Suspense>
  );
}
