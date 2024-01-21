import Page from 'components/Page';
import UserForm from 'components/UserForm';
import { getMeWithGifts } from 'lib/prisma-ssr';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Edit your profile',
};

const MePage = async () => {
  const user = await getMeWithGifts();
  return (
    <Page title="My Profile">
      <UserForm user={user} />
    </Page>
  );
};

export default MePage;
