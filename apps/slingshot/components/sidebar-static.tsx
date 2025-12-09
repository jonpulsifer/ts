'use client';

import {
  BookOpen,
  Cloud,
  Database,
  Key,
  Plus,
  Terminal,
  Webhook,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useState } from 'react';
import { cn } from '@/lib/utils';
import { CreateProjectModal } from './create-project-modal';
import { NavProjectsSkeleton } from './projects-list-skeleton';
import { Button } from './ui/button';
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
} from './ui/sidebar';

const developerTools = [
  { name: 'Environment', url: '/environment', icon: Terminal },
  { name: 'Request Headers', url: '/request-headers', icon: BookOpen },
  { name: 'JWT Decoder', url: '/jwt-decoder', icon: Key },
  { name: 'Firestore Collections', url: '/gcp', icon: Database },
  { name: 'Cache Management', url: '/cache', icon: Cloud },
];

interface SidebarStaticProps {
  children: React.ReactNode;
}

export function SidebarStatic({ children }: SidebarStaticProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const [createModalOpen, setCreateModalOpen] = useState(false);
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
              <Link href="/" className="group">
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
              </Link>
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
                <Link href="/">
                  <BookOpen className="size-4" />
                  {!isCollapsed && <span>Quick Start</span>}
                </Link>
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
                    <Link href={tool.url}>
                      <tool.icon className="size-4" />
                      {!isCollapsed && <span>{tool.name}</span>}
                    </Link>
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
                WEBHOOK PROJECTS
              </SidebarGroupLabel>
            )}
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto"
                onClick={() => setCreateModalOpen(true)}
                title="Create new webhook project"
              >
                <Plus className="size-3" />
              </Button>
            )}
          </div>
          <Suspense fallback={<NavProjectsSkeleton />}>{children}</Suspense>
        </SidebarGroup>
      </SidebarContent>

      <CreateProjectModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </Sidebar>
  );
}
