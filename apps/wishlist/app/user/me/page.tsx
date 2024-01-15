import type { Metadata } from 'next';
import GiftList from 'components/GiftList';
import Page from 'components/Page';
import { UserProfile } from 'components/User';
import { getMeWithGifts } from 'lib/prisma-ssr';

export const metadata: Metadata = {
  title: 'Your Profile',
  description: 'See your profile',
};

const MePage = async () => {
  const user = await getMeWithGifts();
  return (
    <Page>
      <div className="w-full space-y-4">
        <UserProfile currentUserId={user.id} user={user} />
        <GiftList currentUserId={user.id} gifts={user.gifts} />
      </div>
    </Page>
  );
};

export default MePage;
