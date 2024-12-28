import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

import { auth } from '@/app/auth';
import { AddGiftDialog } from '@/components/add-gift-dialog';
import { Button } from '@/components/ui/button';
import {
  getPeopleForNewGiftModal,
  getSortedVisibleGiftsForUser,
} from '@/lib/db/queries-cached';
import { Plus } from 'lucide-react';
import { unauthorized } from 'next/navigation';
import { GiftList } from './gift-list';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GiftsPage({ searchParams }: PageProps) {
  // Pass the initial search params to the client component
  const { q, sort, direction } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const gifts = await getSortedVisibleGiftsForUser({
    userId: session.user.id,
    direction: direction as 'asc' | 'desc',
    column: sort as 'name' | 'owner',
  });

  const users = await getPeopleForNewGiftModal(session.user.id);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Gifts</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gifts</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              The gifts in this list include: Claimable gifts, Gifts that you
              have created, and Gifts that you have already claimed.
            </p>
          </div>
          <AddGiftDialog users={users} currentUser={session.user} />
        </div>
        <GiftList
          initialGifts={gifts}
          search={q as string}
          sort={sort as 'name' | 'owner'}
          direction={direction as 'asc' | 'desc'}
        />
      </div>
    </SidebarInset>
  );
}
