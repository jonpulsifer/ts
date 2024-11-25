import { Divider, Heading } from '@repo/ui';
import { getMe } from 'lib/db/queries';
import type { Metadata } from 'next';

import UserForm from './components/user-form';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Edit your profile',
};

const SettingsPage = async () => {
  const user = await getMe();
  return (
    <>
      <Heading>Profile Settings</Heading>
      <Divider soft className="my-4" />
      <UserForm user={user} />
    </>
  );
};

export default SettingsPage;
