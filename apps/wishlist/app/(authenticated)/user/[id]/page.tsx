import { Divider, Heading, Strong, Text } from '@repo/ui';
import GiftRecommendations, {
  GiftRecommendationsFallback,
} from 'components/gift-recommendations';
import { GiftTable } from 'components/gift-table';
import { getUserById, getVisibleGiftsForUserById } from 'lib/prisma-ssr';
import type { Metadata } from 'next';
import { Suspense } from 'react';

import { UserProfile } from './components/user-profile';

interface Props {
  params: { [K in string]: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUserById(params.id);
  const { name, email } = user;
  const title = `${name || email}'s Profile`;
  return {
    title,
    description: title,
  };
}

const ProfilePage = async ({ params }: Props) => {
  const profile = await getUserById(params.id);
  const { gifts, user } = await getVisibleGiftsForUserById(params.id);
  const isUserProfile = user.id === profile.id;
  const nameOrEmailOrDefault = profile.name || profile.email || 'Anonymous';
  const title = isUserProfile ? `Your Profile` : nameOrEmailOrDefault;
  return (
    <>
      <Heading>{title}</Heading>
      <Divider soft className="my-4" />
      <UserProfile currentUserId={user.id} user={profile} />
      <Divider soft className="my-4" />
      <Suspense fallback={GiftRecommendationsFallback}>
        <GiftRecommendations userId={profile.id} />
      </Suspense>
      {gifts.length ? (
        <GiftTable currentUserId={user.id} gifts={gifts} />
      ) : (
        <Text>
          No gifts found. <Strong>Add more gifts</Strong> to this wishlist!
        </Text>
      )}
    </>
  );
};

export default ProfilePage;
