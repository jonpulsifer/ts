import { UserProfile } from 'components/User';
import { getCurrentUser, getAllUserGifts } from 'lib/firebase-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Profile',
  description: 'See your profile',
};

const MePage = async () => {
  const { user } = await getCurrentUser();
  const { gifts } = await getAllUserGifts();
  return <UserProfile gifts={gifts} appUser={user} />;
};

export default MePage;
