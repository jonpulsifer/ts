import { DocumentCheckIcon, GiftIcon } from '@heroicons/react/16/solid';
import {
  Avatar,
  Divider,
  Heading,
  Strong,
  Subheading,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Text,
} from '@repo/ui';
import { getUsersForPeoplePage, getVisibleGiftsForUser } from 'lib/prisma-ssr';
import { getInitials } from 'lib/user-utils';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'People',
  description: 'View everyone and their gifts',
};

const PeoplePage = async () => {
  const users = await getUsersForPeoplePage();

  const tableRows = users.map((user) => {
    const gifts = user.gifts || [];
    const claimedGifts = gifts.filter((gift) => gift.claimedById);

    const subtitleMarkup = (
      <div
        key={user.id}
        className="flex flex-row gap-4 text-sm text-zinc-500 dark:text-zinc-400"
      >
        <div className="flex flex-row items-center">
          <GiftIcon width={16} className="mr-1" />
          {gifts.length} gift{gifts.length !== 1 ? 's' : ''}
        </div>
        <div className="flex flex-row items-center">
          <DocumentCheckIcon width={16} className="mr-1" />
          {`${claimedGifts.length} claimed`}
        </div>
      </div>
    );

    const avatar = {
      src: user.image || undefined,
      initials: getInitials(user),
    };

    return (
      <TableRow key={user.id} href={`/user/${user.id}`}>
        <TableCell>
          <div className="flex items-center gap-4">
            <Avatar
              square
              src={avatar.src}
              initials={avatar.initials}
              className="size-12"
            />
            <div className="flex flex-col">
              <Subheading>{user.name || user.email || 'Unknown'}</Subheading>
              {subtitleMarkup}
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <>
      <Heading>👨‍👩‍👧‍👦 People</Heading>
      <Divider soft className="my-4" />
      <Text>
        These are all of the people <Strong>in your wishlists</Strong> and their
        gifts. You can <Strong>view someone&apos;s profile by clicking</Strong>{' '}
        on their name.
      </Text>
      <Table bleed dense className="mt-4">
        <TableBody>{tableRows}</TableBody>
      </Table>
    </>
  );
};

export default PeoplePage;
