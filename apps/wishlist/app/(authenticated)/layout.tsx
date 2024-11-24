import { Suspense } from 'react';
import { StackedLayout } from '@repo/ui';
import { isAuthenticated } from 'lib/prisma-ssr';
import { getPeopleForNewGiftModal } from 'lib/prisma-cached';
import { NavBar, Sidebar } from 'components/nav';
import Spinner from 'components/Spinner';
import { CakeIcon } from '@heroicons/react/20/solid';

async function Layout({ children }: { children: React.ReactNode }) {
  const { user: currentUser } = await isAuthenticated();
  const people = await getPeopleForNewGiftModal(currentUser.id);
  return (
    <StackedLayout
      navbar={<NavBar user={currentUser} users={people} />}
      sidebar={<Sidebar />}
    >
      <Suspense fallback={<Spinner Icon={CakeIcon} />}>{children}</Suspense>
    </StackedLayout>
  );
}
export default Layout;
