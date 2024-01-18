import Page from 'components/Page';
import { UserProfile } from 'components/User';
import UserForm from 'components/UserForm';
import { getMeWithGifts } from 'lib/prisma-ssr';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Profile',
  description: 'See your profile',
};

const MePage = async () => {
  const user = await getMeWithGifts();
  return (
    <Page>
      <UserForm user={user} />
    </Page>
  );
};

export default MePage;
