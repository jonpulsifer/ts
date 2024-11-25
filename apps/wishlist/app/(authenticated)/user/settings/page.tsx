import { Divider, Heading } from '@repo/ui';
import { getSession } from 'app/auth';
import type { Metadata } from 'next';

import EmptyState from 'components/EmptyState';
import { getUserById } from 'lib/db/queries-cached';
import UserForm from './components/user-form';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Edit your profile',
};

const SettingsPage = async () => {
  const { user: currentUser } = await getSession();
  const user = await getUserById(currentUser.id);
  if (!user) {
    return <EmptyState title="User not found" />;
  }
  return (
    <>
      <Heading>Profile Settings</Heading>
      <Divider soft className="my-4" />
      <UserForm user={user} />
    </>
  );
};

export default SettingsPage;
