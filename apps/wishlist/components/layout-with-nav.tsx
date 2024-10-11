import { StackedLayout } from '@repo/ui';
import { getPeopleForUser } from 'lib/prisma-ssr';

import {
  GiftIcon,
  HomeIcon,
  LightBulbIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { NavBar, SidebarMarkup } from './nav';

type Props = {
  children: React.ReactNode;
};

export async function Nav({ children }: Props) {
  const { user, users } = await getPeopleForUser();
  return (
    <>
      <StackedLayout
        navbar={<NavBar user={user} users={users} />}
        sidebar={<SidebarMarkup />}
      >
        {children}
      </StackedLayout>
    </>
  );
}
