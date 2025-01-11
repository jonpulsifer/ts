import {
  BookUser,
  Bot,
  CandyCane,
  Gift,
  Home,
  ListCheck,
  Users,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import Image from 'next/image';

import { auth } from '@/app/auth';
import santaIcon from '@/public/santaicon.png';
import { ModeToggle } from './dark-mode-toggle';
import { SidebarUser } from './sidebar-user';

// Menu items.
const items = [
  {
    title: 'Home',
    url: '/home',
    icon: Home,
  },
  {
    title: 'People',
    url: '/people',
    icon: Users,
  },
  {
    title: 'Gifts',
    url: '/gifts',
    icon: Gift,
  },
  {
    title: 'Claimed',
    url: '/gifts/claimed',
    icon: ListCheck,
  },
  {
    title: 'AI',
    url: '#',
    icon: Bot,
  },
  {
    title: 'Secret Santa',
    url: '#',
    icon: CandyCane,
  },
  {
    title: 'Wishlists',
    url: '/wishlists',
    icon: BookUser,
  },
];

const getNextChristmas = () => {
  const today = new Date();
  const thisChristmas = new Date(today.getFullYear(), 11, 25); // month is 0-based
  return today > thisChristmas
    ? new Date(today.getFullYear() + 1, 11, 25)
    : thisChristmas;
};

export async function AppSidebar() {
  const daysUntilChristmas = Math.floor(
    (getNextChristmas().getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const session = await auth();
  const user = session!.user;

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/home">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-transparent text-sidebar-primary-foreground dark:text-sidebar-primary-foreground">
                  <Image
                    src={santaIcon.src}
                    width={32}
                    height={32}
                    alt="wishin.app"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">wishin.app</span>
                  <span className="text-xs text-muted-foreground">
                    {daysUntilChristmas} days until Christmas
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
