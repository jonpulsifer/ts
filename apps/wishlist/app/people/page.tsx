import { Button } from '@repo/ui';
import { Accordion } from 'components/accordion';
import { GiftTable } from 'components/gift-table';
import Page from 'components/Page';
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
    const button = (
      <Button plain href={`/user/${ownerId}`}>
        Profile
      </Button>
    );
    const avatar = {
      src: image,
      initials: name ? name[0].toUpperCase() : email[0].toUpperCase(),
    };
    return (
      <Accordion
        title={title}
        subtitle={subtitleMarkup}
        button={button}
        avatar={avatar}
        key={ownerId}
      >
        <GiftTable gifts={gifts} currentUserId={user.id} />
      </Accordion>
    );
  });

  return (
    <Page title="People">
      <div className="grid gap-4 sm:gap-8">{ownerCards}</div>
    </Page>
  );
};

export default PeoplePage;
