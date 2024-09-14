import { DocumentCheckIcon, GiftIcon } from '@heroicons/react/16/solid';
import {
  Avatar,
  Divider,
  Heading,
  Strong,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Text,
} from '@repo/ui';
import { getVisibleGiftsForUser } from 'lib/prisma-ssr';
import { getInitials } from 'lib/user-utils';
import type { Metadata } from 'next';
import React from 'react';
import type { GiftWithOwner } from 'types/prisma';

export const metadata: Metadata = {
  title: 'People',
  description: 'View everyone and their gifts',
};

const PeoplePage = async () => {
  const { gifts } = await getVisibleGiftsForUser();
  const giftsByOwnerId = gifts.reduce<Record<string, GiftWithOwner[]>>(
    (acc, gift) => {
      const ownerId = gift.ownerId;
      const ownerGifts = acc[ownerId] || [];
      acc[ownerId] = ownerGifts.concat(gift);
      return acc;
    },
    {},
  );

  const tableRows = Object.keys(giftsByOwnerId).map((ownerId) => {
    const gifts = giftsByOwnerId[ownerId];
    if (!gifts || !gifts.length) return null;

    const owner = (gifts[0] as GiftWithOwner).owner;
    const title = owner.name || owner.email || 'Unknown';
    const claimedGifts = gifts.filter((gift) => gift.claimedById);

    const { image } = owner;

    // subtitle is the count of gifts for this owner
    const subtitleMarkup = (
      <div
        key={ownerId}
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
      src: image || undefined,
      initials: getInitials(owner),
    };

    return (
      <TableRow key={ownerId} href={`/user/${ownerId}`}>
        <TableCell>
          <div className="flex items-center gap-4">
            <Avatar
              square
              src={avatar.src}
              initials={avatar.initials}
              className="size-12"
            />
            <div className="flex flex-col">
              <Heading>{title}</Heading>
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
      <Table bleed dense>
        <TableBody>{tableRows}</TableBody>
      </Table>
    </>
  );
};

export default PeoplePage;
