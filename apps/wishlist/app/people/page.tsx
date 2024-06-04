import { Avatar, Heading, Link, Subheading } from '@repo/ui';
import { Card } from '@repo/ui/card';
import { getVisibleGiftsForUser } from 'lib/prisma-ssr';
import { Gift, ListChecks } from 'lucide-react';
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

  const ownerCards = Object.keys(giftsByOwnerId).map((ownerId) => {
    const gifts = giftsByOwnerId[ownerId];
    const title = gifts[0].owner.name || gifts[0].owner.email;
    const claimedGifts = gifts.filter((gift) => gift.claimedById);

    const { name, email, image } = gifts[0].owner;

    // subtitle is the count of gifts for this owner
    const subtitleMarkup = (
      <div
        key={ownerId}
        className="flex flex-row gap-4 text-xs text-zinc-500 dark:text-zinc-400"
      >
        <div className="flex flex-row items-center">
          <Gift width={16} className="mr-1" />
          {gifts.length} gift{gifts.length > 1 ? 's' : ''}
        </div>
        <div className="flex flex-row items-center">
          <ListChecks width={16} className="mr-1" />
          {`${claimedGifts.length} claimed`}
        </div>
      </div>
    );

    const avatar = {
      src: image,
      initials: name ? name[0].toUpperCase() : email[0].toUpperCase(),
    };

    return (
      <Card key={ownerId}>
        <Link href={`/user/${ownerId}`}>
          <div className="flex flex-row justify-between">
            <div className="flex flex-row items-center gap-2">
              <Avatar
                src={avatar.src}
                initials={avatar.initials}
                className="size-12 bg-zinc-200/80 dark:bg-zinc-950 dark:text-indigo-500"
              />
              <div className="flex flex-col">
                <Heading>{title}</Heading>
                <Subheading>{subtitleMarkup}</Subheading>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  });

  return <div className="grid gap-4 sm:gap-8">{ownerCards}</div>;
};

export default PeoplePage;
