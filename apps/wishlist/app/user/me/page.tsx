import GiftList from 'components/GiftList';
import { UserProfile } from 'components/User';
import { getMeWithGifts } from 'lib/prisma-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Profile',
  description: 'See your profile',
};

const MePage = async () => {
  const user = await getMeWithGifts();
  return (
    <div className="w-full space-y-4">
      <UserProfile user={user} currentUserId={user.id} />
      <GiftList gifts={user.gifts} currentUserId={user.id} />
    </div>
  );
};

export default MePage;
