import { auth, signOut } from '@/app/auth';
import { AddGiftDialog } from '@/components/add-gift-dialog';
import { ModeToggle } from '@/components/dark-mode-toggle';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { getPeopleForNewGiftModal } from '@/lib/db/queries-cached';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }
  const addGiftDialogUsers = await getPeopleForNewGiftModal(session.user.id);
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Home</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-4">
          <ModeToggle />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold tracking-tight">
          🚧 Under Construction 🏗️
        </h1>
        <p className="text-sm text-muted-foreground">
          The wishlist is currently under construction so there may be some
          issues. If you find any, do not let me know until Constance's birthday
          is over.
        </p>
        <AddGiftDialog currentUser={session.user} users={addGiftDialogUsers} />
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/90" />
          <div className="aspect-video rounded-xl bg-muted/90" />
          <div className="aspect-video rounded-xl bg-muted/90" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/90 md:min-h-min" />
      </div>
    </SidebarInset>
  );
}
