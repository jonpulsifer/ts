import { Divider, Heading, Strong, Text } from '@repo/ui';
import { getSession } from 'app/auth';
import { GiftTable } from 'components/gift-table';
import GiftRecommendations, {
  GiftRecommendationsFallback,
} from 'components/recommendations-user';
import {
  getUserById,
  getUsers,
  getVisibleGiftsForUserById,
} from 'lib/db/queries-cached';
import type { Metadata } from 'next';
import { Suspense } from 'react';

import { GiftIcon } from '@heroicons/react/24/solid';
import Spinner from 'components/Spinner';
import { notFound } from 'next/navigation';
import { UserProfile } from './components/user-profile';

interface Props {
  params: { [K in string]: string };
}

export async function generateStaticParams() {
  const users = await getUsers();
  return users.map((user) => ({ id: user.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!params.id) {
    notFound();
  }
  const user = await getUserById(params.id);
  if (!user) {
    notFound();
  }
  const title = `${user.name || user.email}'s Profile`;
  return {
    title,
    description: title,
  };
}

const ProfilePage = async ({ params }: Props) => {
  if (!params.id) notFound();

  const { user: currentUser } = await getSession();
  if (!currentUser) notFound();

  const profile = await getUserById(params.id);
  if (!profile) notFound();

  const gifts = await getVisibleGiftsForUserById(params.id, currentUser.id);
  const isUserProfile = currentUser.id === profile.id;
  const nameOrEmailOrDefault = profile.name || profile?.email || 'Anonymous';
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
      <Suspense fallback={<Spinner Icon={GiftIcon} />}>
        {gifts.length ? (
          <GiftTable currentUserId={currentUser.id} gifts={gifts} />
        ) : (
          <Text>
            No gifts found. <Strong>Add more gifts</Strong> to this wishlist!
          </Text>
        )}
      </Suspense>
    </>
  );
};

export default ProfilePage;
