import { StackedLayout } from '@repo/ui';
import { isAuthenticated } from 'lib/prisma-ssr';
import {
  GiftIcon,
  GroupIcon,
  HomeIcon,
  ListChecks,
  UsersIcon,
} from 'lucide-react';

import { NavBar, SidebarMarkup } from './sidebar';

const navItems = [
  { label: 'Home', url: '/', icon: <HomeIcon size={16} /> },
  { label: 'People', url: '/people', icon: <UsersIcon size={16} /> },
  { label: 'Gifts', url: '/gifts', icon: <GiftIcon size={16} /> },
  { label: 'Claimed', url: '/claimed', icon: <ListChecks size={16} /> },
  { label: 'Wishlists', url: '/wishlists', icon: <GroupIcon size={16} /> },
];

type Props = {
  children: React.ReactNode;
};

export async function Nav({ children }: Props) {
  const session = await isAuthenticated();
  return (
    <StackedLayout
      navbar={<NavBar user={session.user} items={navItems} />}
      sidebar={<SidebarMarkup user={session.user} items={navItems} />}
    >
      {children}
    </StackedLayout>
  );
}
