import { CogIcon } from '@heroicons/react/16/solid';
import { Button, Divider, Heading } from '@repo/ui';
import GiftRecommendations from 'components/gift-recommendations';
import { GiftTable } from 'components/gift-table';
import {
  getGiftsWithOwnerByUserId,
  getMe,
  getRecommendations,
} from 'lib/prisma-ssr';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'View your profile',
};

const MePage = async () => {
  const user = await getMe();
  const gifts = await getGiftsWithOwnerByUserId(user.id);
  const recommendations = await getRecommendations(user.id);
  const recommendationsMarkup = recommendations ? (
    <GiftRecommendations recommendations={recommendations} />
  ) : null;
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
      {recommendationsMarkup}
      <GiftTable gifts={gifts} currentUserId={user.id} />
    </>
  );
};

export default MePage;
