'use client';

import {
  BookOpen,
  Cloud,
  FlaskConical,
  Home,
  Network,
  Send,
  Terminal,
  Webhook,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import type * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const projects = [
  { name: 'Home', url: '/', icon: Home },
  { name: 'Environment', url: '/environment', icon: Terminal },
  { name: 'Fetcher', url: '/fetcher', icon: Send },
  { name: 'Network Tools', url: '/network', icon: Network },
  { name: 'Request Headers', url: '/request-headers', icon: BookOpen },
  { name: 'Webhook Testing', url: '/webhook', icon: Webhook },
  { name: 'GCP Auth', url: '/gcp', icon: Cloud },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/" className="group">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/50 transition-all group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-indigo-500/50">
                  <FlaskConical className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold">Next.js</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Developer Tools
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu>
            {projects.map((item) => {
              const isActive =
                pathname === item.url ||
                (item.url !== '/' && pathname.startsWith(item.url));
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      'transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive &&
                        'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm',
                    )}
                  >
                    <a href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
