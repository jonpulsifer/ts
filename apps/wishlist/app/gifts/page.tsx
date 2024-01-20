import { Accordion } from 'components/accordion';
import Page from 'components/Page';
import { getVisibleGiftsForUser } from 'lib/prisma-ssr';
import type { Metadata } from 'next';
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
    return (
      <Accordion title={title}>
        <GiftTable gifts={gifts} currentUserId={user.id} />
      </Accordion>
    );
  });
  return (
    <Page>
      <div className="grid gap-4 sm:gap-8">{ownerCards}</div>
    </Page>
  );
};

export default GiftsPage;
