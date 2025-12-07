import { Suspense } from 'react';
import { getAllProjects } from '@/lib/projects-storage';
import { ProjectsListClient } from './projects-list-client';
import { NavProjectsSkeleton } from './projects-list-skeleton';
import { SidebarGroupContent } from './ui/sidebar';

async function NavProjects() {
  const projects = await getAllProjects();
  return <ProjectsListClient initialProjects={projects} />;
}

export function ProjectsList() {
  return (
    <SidebarGroupContent>
      <Suspense fallback={<NavProjectsSkeleton />}>
        <NavProjects />
      </Suspense>
    </SidebarGroupContent>
  );
}
