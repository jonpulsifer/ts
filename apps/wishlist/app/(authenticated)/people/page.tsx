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
import type { Metadata } from 'next';
import React from 'react';
import { GiftWithOwner } from 'types/prisma';

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
      return {
        ...acc,
        [ownerId]: [...ownerGifts, gift],
      };
    },
    {},
  );

  const tableRows = Object.keys(giftsByOwnerId).map((ownerId) => {
    const gifts = giftsByOwnerId[ownerId];
    const title = gifts[0].owner.name || gifts[0].owner.email;
    const claimedGifts = gifts.filter((gift) => gift.claimedById);

    const { name, email, image } = gifts[0].owner;

    // subtitle is the count of gifts for this owner
    const subtitleMarkup = (
      <div
        key={ownerId}
        className="flex flex-row gap-4 text-sm text-zinc-500 dark:text-zinc-400"
      >
        <div className="flex flex-row items-center">
          <GiftIcon width={16} className="mr-1" />
          {gifts.length} gift{gifts.length > 1 ? 's' : ''}
        </div>
        <div className="flex flex-row items-center">
          <DocumentCheckIcon width={16} className="mr-1" />
          {`${claimedGifts.length} claimed`}
        </div>
      </div>
    );

    const avatar = {
      src: image,
      initials: name ? name[0].toUpperCase() : email[0].toUpperCase(),
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
