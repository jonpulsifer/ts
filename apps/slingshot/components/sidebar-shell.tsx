import { ProjectsList } from './projects-list-sidebar';
import { SidebarStatic } from './sidebar-static';

export function SidebarShell() {
  return (
    <SidebarStatic>
      <ProjectsList />
    </SidebarStatic>
  );
}
