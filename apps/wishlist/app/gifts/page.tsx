import { Button } from '@repo/ui';
import { Accordion } from 'components/accordion';
import Page from 'components/Page';
import { getVisibleGiftsForUser } from 'lib/prisma-ssr';
import { Gift, ListChecks } from 'lucide-react';
import type { Metadata } from 'next';
import React from 'react';
import { GiftWithOwner } from 'types/prisma';

import { GiftTable } from './components/gift-table';

export const metadata: Metadata = {
  title: 'Gifts',
  description: "See everyone's gifts",
};

const GiftsPage = async () => {
  const { gifts, user } = await getVisibleGiftsForUser();
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

    // subtitle is the count of gifts for this owner
    const subtitleMarkup = (
      <div className="flex flex-row gap-4 text-xs text-zinc-500 dark:text-zinc-400">
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
    const button = (
      <Button outline href={`/user/${ownerId}`}>
        Visit Profile
      </Button>
    );
    return (
      <Accordion title={title} subtitle={subtitleMarkup} button={button}>
        <GiftTable gifts={gifts} currentUserId={user.id} />
      </Accordion>
    );
  });
  // set the first one to open
  return (
    <Page title="Everyone's Gifts">
      <div className="grid gap-4 sm:gap-8">{ownerCards}</div>
    </Page>
  );
};

export default GiftsPage;
