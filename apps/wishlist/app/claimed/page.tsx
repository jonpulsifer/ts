import { Gift } from 'lucide-react';
import type { Metadata } from 'next';

import EmptyState from '../../components/EmptyState';
import GiftList from '../../components/GiftList';
import Page from '../../components/Page';
import { getClaimedGiftsForMe } from '../../lib/prisma-ssr';

export const metadata: Metadata = {
  title: 'Claimed Gifts',
  description: 'See what gifts you have claimed',
};

const ClaimedPage = async () => {
  const { gifts, user } = await getClaimedGiftsForMe();

  const markup = gifts.length ? (
    <GiftList currentUserId={user.id} gifts={gifts} />
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
