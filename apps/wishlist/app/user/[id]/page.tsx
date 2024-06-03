import { Card, Divider, Heading, Strong, Text } from '@repo/ui';
import { GiftTable } from 'components/gift-table';
import Page from 'components/Page';
import { getUserById, getVisibleGiftsForUserById } from 'lib/prisma-ssr';
import type { Metadata } from 'next';

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
  const title = isUserProfile
    ? `Your Profile`
    : `${nameOrEmailOrDefault}'s Profile`;
  return (
    <Page title="View Profile">
      <Card title={title}>
        <UserProfile currentUserId={user.id} user={profile} />
        <Divider className="my-4" />
        <Heading level={2}>Gifts</Heading>
        {gifts.length ? (
          <GiftTable currentUserId={user.id} gifts={gifts} />
        ) : (
          <Text>
            No gifts found. <Strong>Add more gifts</Strong> to this wishlist!
          </Text>
        )}
      </Card>
    </Page>
  );
};

export default ProfilePage;
