'use client';

import { Webhook } from 'lucide-react';
import Link from 'next/link';
import { Badge } from './ui/badge';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from './ui/sidebar';

export function NavProjectsSkeleton() {
  // Get sidebar state to check if collapsed
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarMenu>
      {/* Show the default slingshot project (always exists) - dimmed to indicate loading */}
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          tooltip="slingshot"
          className="transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex-1 opacity-60 animate-pulse"
        >
          <Link href="/slingshot">
            <Webhook className="size-4 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="truncate">slingshot</span>
                <Badge
                  variant="outline"
                  className="ml-auto text-[10px] px-1 py-0 h-4 border-primary/30 text-primary bg-primary/10"
                >
                  Default
                </Badge>
              </>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Show skeleton for loading additional projects */}
      <SidebarMenuItem>
        <SidebarMenuSkeleton showIcon />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
