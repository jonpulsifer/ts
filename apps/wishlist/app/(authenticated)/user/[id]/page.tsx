import { Divider, Heading, Strong, Text } from '@repo/ui';
import { GiftTable } from 'components/gift-table';
import GiftRecommendations, {
  GiftRecommendationsFallback,
} from 'components/recommendations-user';
import { getMe, getUserById, getVisibleGiftsForUserById } from 'lib/prisma-ssr';
import type { Metadata } from 'next';
import { Suspense } from 'react';

import { notFound } from 'next/navigation';
import { UserProfile } from './components/user-profile';

interface Props {
  params: { [K in string]: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!params.id) {
    notFound();
  }
  const user = await getUserById(params.id);
  const { name, email } = user;
  const title = `${name || email}'s Profile`;
  return {
    title,
    description: title,
  };
}

const ProfilePage = async ({ params }: Props) => {
  if (!params.id) {
    notFound();
  }
  const profile = await getUserById(params.id);
  const currentUser = await getMe();
  const gifts = await getVisibleGiftsForUserById(params.id);
  const isUserProfile = currentUser.id === profile.id;
  const nameOrEmailOrDefault = profile.name || profile.email || 'Anonymous';
  const title = isUserProfile ? 'Your Profile' : nameOrEmailOrDefault;
  return (
    <>
      <Heading>{title}</Heading>
      <Divider soft className="my-4" />
      <UserProfile currentUserId={currentUser.id} user={profile} />
      <Divider soft className="my-4" />
      <Suspense fallback={GiftRecommendationsFallback}>
        <GiftRecommendations forUser={profile} />
      </Suspense>
      {gifts.length ? (
        <GiftTable currentUserId={currentUser.id} gifts={gifts} />
      ) : (
        <Text>
          No gifts found. <Strong>Add more gifts</Strong> to this wishlist!
        </Text>
      )}
    </>
  );
};

export default ProfilePage;
