import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { getAllProjects } from '@/lib/projects-storage';
import { HowToUseExamples } from './how-to-use-examples';

async function ProjectsListContent() {
  'use cache';

  const projects = await getAllProjects();
  const defaultProject = projects[0]?.slug || 'slingshot';

  return (
    <HowToUseExamples projects={projects} defaultProject={defaultProject} />
  );
}

function ProjectsListSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="absolute inset-0 h-8 w-8 animate-spin text-primary/20">
            <Loader2 className="h-8 w-8" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function ProjectsList() {
  return (
    <Suspense fallback={<ProjectsListSpinner />}>
      <ProjectsListContent />
    </Suspense>
  );
}
