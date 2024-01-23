import Page from 'components/Page';
import { getGiftsWithOwnerByUserId, getMe } from 'lib/prisma-ssr';
import type { Metadata } from 'next';

import ProfileTabs from './components/profile-tabs';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Edit your profile',
};

const MePage = async () => {
  const user = await getMe();
  const gifts = await getGiftsWithOwnerByUserId(user.id);
  return (
    <Page title="My Profile">
      <ProfileTabs user={user} gifts={gifts} />
    </Page>
  );
};

export default MePage;
