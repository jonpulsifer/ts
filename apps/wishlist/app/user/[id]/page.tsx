import GiftList from 'components/GiftList';
import Page from 'components/Page';
import { UserProfile } from 'components/User';
import { getUser, getUserGifts } from 'lib/firebase-ssr';
import { Metadata } from 'next';

interface Props {
  params: { [K in string]: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { user } = await getUser(params.id);
  const { name, email } = user;
  const title = `${name || email}'s Profile`;
  return {
    title,
    description: title,
  };
}

const ProfilePage = async ({ params }: Props) => {
  const { user, gifts } = await getUserGifts(params.id);
  return (
    <Page title={user.name || user.email}>
      <UserProfile appUser={user} />
      <GiftList gifts={gifts} />
    </Page>
  );
};

export default ProfilePage;
