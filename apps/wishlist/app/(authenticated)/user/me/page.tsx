import { CogIcon } from '@heroicons/react/16/solid';
import { Button, Divider, Heading } from '@repo/ui';
import { GiftTable } from 'components/gift-table';
import GiftRecommendations, {
  GiftRecommendationsFallback,
} from 'components/recommendations-user';
import { getMe, getVisibleGiftsForUserById } from 'lib/prisma-ssr';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'View your profile',
};

const MePage = async () => {
  const user = await getMe();
  const gifts = await getVisibleGiftsForUserById(user.id);
  return (
    <>
      <div className="flex w-full flex-wrap items-end justify-between">
        <Heading>My Profile</Heading>
        <div className="flex gap-4">
          <Button outline href={'/user/settings'}>
            <CogIcon />
            Settings
          </Button>
        </div>
      </div>
      <Divider soft className="my-4" />
      <Suspense fallback={GiftRecommendationsFallback}>
        <GiftRecommendations forUser={user} />
      </Suspense>
      <GiftTable gifts={gifts} currentUserId={user.id} />
    </>
  );
};

export default MePage;
