import { Divider, Heading } from '@repo/ui';
import { isAuthenticated } from 'lib/db/queries';
import type { Metadata } from 'next';

import UserForm from './components/user-form';
import { getUserById } from 'lib/db/queries-cached';
import EmptyState from 'components/EmptyState';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Edit your profile',
};

const SettingsPage = async () => {
  const { user: currentUser } = await isAuthenticated();
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
