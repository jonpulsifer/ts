import { Suspense } from 'react';
import Loading from './loading';
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
    <Suspense fallback={<Loading />}>
      <UserProfile gifts={gifts} appUser={user} />
    </Suspense>
  );
};

export default ProfilePage;
