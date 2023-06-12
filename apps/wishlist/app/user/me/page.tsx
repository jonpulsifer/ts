import { Suspense } from 'react';
import Frame from '../../../components/Frame';
import Loading from './loading';
import { UserProfile } from '../../../components/User';
import { getCurrentUser, getAllUserGifts } from '../../../lib/firebase-ssr';

const MePage = async () => {
  const { user } = await getCurrentUser();
  const { gifts } = await getAllUserGifts();
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

export default MePage;
