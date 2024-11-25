import { LockClosedIcon } from '@heroicons/react/24/solid';
import { StackedLayout } from '@repo/ui';
import { auth } from 'app/auth';
import Spinner from 'components/Spinner';
import { NavBar, Sidebar } from 'components/nav';
import { getPeopleForNewGiftModal } from 'lib/prisma-cached';
import { SessionProvider } from 'next-auth/react';

async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) return <Spinner Icon={LockClosedIcon} />;
  const people = await getPeopleForNewGiftModal(session.user.id);
  return (
    <SessionProvider session={session}>
      <StackedLayout
        navbar={<NavBar user={session.user} users={people} />}
        sidebar={<Sidebar />}
      >
        {children}
      </StackedLayout>
    </SessionProvider>
  );
}
export default Layout;
