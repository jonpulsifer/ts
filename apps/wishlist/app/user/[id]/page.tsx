import { Suspense } from 'react';
import Frame from '../../../components/Frame';
import Loading from '../../../components/Loading';
import { UserProfile } from '../../../components/User';
import { getUserGifts } from '../../../lib/firebase-ssr';

interface Props {
  params: { [K in string]: string };
}

const ProfilePage = async ({ params }: Props) => {
  const { user, gifts } = await getUserGifts(params.id);
  const { name, email } = user;
  const titleMarkup = `${name || email}'s Profile`;
  return (
    <Frame title={titleMarkup}>
      <Suspense fallback={<Loading />}>
        <UserProfile gifts={gifts} appUser={user} />
      </Suspense>
    </Frame>
  );
};

export default ProfilePage;
