import { GiftIcon } from '@heroicons/react/16/solid';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { Divider, Heading, Strong, Text } from '@repo/ui';
import EmptyState from 'components/EmptyState';
import Spinner from 'components/Spinner';
import { GiftTable } from 'components/gift-table';
import { getClaimedGiftsForMe } from 'lib/db/queries-cached';
import { isAuthenticated } from 'lib/db/queries';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Claimed Gifts',
  description: 'See what gifts you have claimed',
};

const ClaimedPage = async () => {
  const { user } = await isAuthenticated();
  const gifts = await getClaimedGiftsForMe(user.id);

  if (!gifts.length) {
    return (
      <EmptyState
        action={{
          title: 'View gifts',
          link: '/gifts',
          icon: GiftIcon,
        }}
        subtitle="You have not claimed any gifts"
        title="🛒 No Claimed Gifts"
      >
        <div className="p-4">
          <p>
            <span className="font-semibold dark:text-zinc-200 text-black dark:text-zinc-200">
              Claim a gift
            </span>{' '}
            before they&apos;re all gone.
          </p>
        </div>
      </EmptyState>
    );
  }

  return (
    <>
      <Heading>🛒 Reserved items</Heading>
      <Divider soft className="my-4" />
      <Text className="my-4">
        These are all of the items you have <Strong>claimed</Strong> (reserved).
        You can unclaim them if you change your mind.{' '}
        <Strong>Make sure to purchase the gift</Strong> when you are ready.
      </Text>
      <Suspense fallback={<Spinner Icon={CheckCircleIcon} />}>
        <GiftTable currentUserId={user.id} gifts={gifts} showGiftOwner />
      </Suspense>
    </>
  );
};

export default ClaimedPage;
