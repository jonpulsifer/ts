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
  return <ProfileTabs user={user} gifts={gifts} />;
};

export default MePage;
