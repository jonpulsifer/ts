import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import {
  Divider,
  Heading,
  Strong,
  Subheading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@repo/ui';
import { auth } from 'app/auth';
import { GiftTable } from 'components/gift-table';
import { TableActions } from 'components/table-actions';
import {
  getGiftsWithOwnerByUserId,
  getLatestVisibleGiftsForUserById,
} from 'lib/prisma-ssr';
import { timeAgo } from 'lib/utils';

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const { gifts } = await getLatestVisibleGiftsForUserById(session.user.id);
  const userGifts = await getGiftsWithOwnerByUserId(session.user.id);

  const giftRows = gifts.map((gift) => {
    const createdAtHumanReadable = timeAgo(gift.createdAt);
    return (
      <TableRow href={`/gift/${gift.id}`}>
        <TableCell>
          <div className="flex flex-col">
            <Text>
              <Strong>{gift.name}</Strong>
            </Text>
            <span className="text-xs text-zinc-500">
              <span className="font-semibold">
                <Strong>{gift.owner.name || gift.owner.email}</Strong>
              </span>{' '}
              created {createdAtHumanReadable}
            </span>
          </div>
        </TableCell>
        <TableCell className="">
          <div className="text-right space-x-4">
            <TableActions gift={gift} currentUserId={session.user.id} />
          </div>
        </TableCell>
      </TableRow>
    );
  });

  const yourGifts = (
    <GiftTable gifts={userGifts} currentUserId={session.user.id} />
  );

  const latestGifts = (
    <div>
      <Text>Below are the latest 10 gifts that you can see!</Text>
      <Table dense>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>{giftRows}</TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4 sm:gap-y-2">
      <div>
        <Heading>Welcome to wishin.app</Heading>
        <Subheading>A wishlist app for friends and family</Subheading>
      </div>
      <Divider className="my-4" soft />

      <TabGroup className="flex flex-col gap-4">
        <TabList className="flex gap-4 font-semibold">
          <Tab className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium text-zinc-950 sm:py-2 sm:text-sm/5 data-[slot=icon]:*:size-6 data-[slot=icon]:*:shrink-0 data-[slot=icon]:*:fill-zinc-500 sm:data-[slot=icon]:*:size-5 data-[slot=icon]:last:*:ml-auto data-[slot=icon]:last:*:size-5 sm:data-[slot=icon]:last:*:size-4 data-[slot=avatar]:*:-m-0.5 data-[slot=avatar]:*:size-7 data-[slot=avatar]:*:[--ring-opacity:10%] sm:data-[slot=avatar]:*:size-6 data-[hover]:bg-zinc-950/5 data-[slot=icon]:*:data-[hover]:fill-zinc-950 data-[active]:bg-zinc-950/5 data-[selected]:bg-zinc-500/15 data-[slot=icon]:*:data-[active]:fill-zinc-950 data-[slot=icon]:*:data-[current]:fill-zinc-950 dark:text-white dark:data-[slot=icon]:*:fill-zinc-400 dark:data-[hover]:bg-white/5 dark:data-[slot=icon]:*:data-[hover]:fill-white dark:data-[active]:bg-white/5 dark:data-[slot=icon]:*:data-[active]:fill-white dark:data-[slot=icon]:*:data-[current]:fill-white">
            Latest Gifts
          </Tab>
          <Tab className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium text-zinc-950 sm:py-2 sm:text-sm/5 data-[slot=icon]:*:size-6 data-[slot=icon]:*:shrink-0 data-[slot=icon]:*:fill-zinc-500 sm:data-[slot=icon]:*:size-5 data-[slot=icon]:last:*:ml-auto data-[slot=icon]:last:*:size-5 sm:data-[slot=icon]:last:*:size-4 data-[slot=avatar]:*:-m-0.5 data-[slot=avatar]:*:size-7 data-[slot=avatar]:*:[--ring-opacity:10%] sm:data-[slot=avatar]:*:size-6 data-[hover]:bg-zinc-950/5 data-[slot=icon]:*:data-[hover]:fill-zinc-950 data-[active]:bg-zinc-950/5 data-[selected]:bg-zinc-500/15 data-[slot=icon]:*:data-[active]:fill-zinc-950 data-[slot=icon]:*:data-[current]:fill-zinc-950 dark:text-white dark:data-[slot=icon]:*:fill-zinc-400 dark:data-[hover]:bg-white/5 dark:data-[slot=icon]:*:data-[hover]:fill-white dark:data-[active]:bg-white/5 dark:data-[slot=icon]:*:data-[active]:fill-white dark:data-[slot=icon]:*:data-[current]:fill-white">
            Your Gifts
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>{latestGifts}</TabPanel>
          <TabPanel>{yourGifts}</TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
