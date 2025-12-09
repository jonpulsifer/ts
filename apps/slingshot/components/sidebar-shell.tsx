import { Suspense } from 'react';
import { ProjectsList } from './projects-list-sidebar';
import { NavProjectsSkeleton } from './projects-list-skeleton';
import { SidebarStatic } from './sidebar-static';

export function SidebarShell() {
  return (
    <SidebarStatic>
      <Suspense fallback={<NavProjectsSkeleton />}>
        <ProjectsList />
      </Suspense>
    </SidebarStatic>
  );
}
