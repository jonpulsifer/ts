import GiftList from 'components/GiftList';
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
  return (
    <div className="w-full space-y-4">
      <UserProfile appUser={user} />
      <GiftList gifts={gifts} />
    </div>
  );
};

export default MePage;
