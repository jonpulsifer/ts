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
    <div className="w-full">
      <UserProfile gifts={gifts} appUser={user} />
    </div>
  );
};

export default MePage;
