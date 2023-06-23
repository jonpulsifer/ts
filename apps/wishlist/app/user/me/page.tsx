import GiftList from 'components/GiftList';
import Page from 'components/Page';
import { UserProfile } from 'components/User';
import { getAllUserGifts, getCurrentUser } from 'lib/firebase-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Profile',
  description: 'See your profile',
};

const MePage = async () => {
  const { user } = await getCurrentUser();
  const { gifts } = await getAllUserGifts();
  return (
    <Page>
      <div className="w-full space-y-4">
        <UserProfile appUser={user} />
        <GiftList gifts={gifts} />
      </div>
    </Page>
  );
};

export default MePage;
