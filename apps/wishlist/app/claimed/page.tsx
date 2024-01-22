import { Card } from '@repo/ui';
import { GiftTable } from 'app/gifts/components/gift-table';
import { Gift } from 'lucide-react';
import type { Metadata } from 'next';

import EmptyState from '../../components/EmptyState';
import Page from '../../components/Page';
import { getClaimedGiftsForMe } from '../../lib/prisma-ssr';

export const metadata: Metadata = {
  title: 'Claimed Gifts',
  description: 'See what gifts you have claimed',
};

const ClaimedPage = async () => {
  const { gifts, user } = await getClaimedGiftsForMe();

  const markup = gifts.length ? (
    <Card
      title="🛒 Reserved items"
      subtitle="These are all of the items you have claimed (reserved). You can unclaim them if you change your mind. Make sure to purchase the gift when you are ready."
    >
      <GiftTable currentUserId={user.id} gifts={gifts} showGiftOwner />
    </Card>
  ) : (
    <EmptyState
      action={{
        title: 'View gifts',
        link: '/gifts',
        icon: Gift,
      }}
      subtitle="You have not claimed any gifts"
      title="🛒 No Claimed Gifts"
    >
      <div className="p-4">
        <p>
          <span className="font-semibold dark:text-slate-200 text-black dark:text-slate-200">
            Claim a gift
          </span>{' '}
          before they&apos;re all gone.
        </p>
      </div>
    </EmptyState>
  );

  return <Page title="Claimed Gifts">{markup}</Page>;
};

export default ClaimedPage;
