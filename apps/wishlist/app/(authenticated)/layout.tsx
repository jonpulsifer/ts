import { auth } from '@/app/auth';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
// import { getPeopleForNewGiftModal } from 'lib/db/queries-cached';
import { SessionProvider } from 'next-auth/react';

async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) return 'Loading...';
  // const people = await getPeopleForNewGiftModal(session.user.id);
  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1">{children}</main>
      </SidebarProvider>
    </SessionProvider>
  );
}
export default Layout;
