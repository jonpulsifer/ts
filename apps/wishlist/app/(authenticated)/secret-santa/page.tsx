import { Divider, Heading, Subheading, Text } from '@repo/ui';
import { getSecretSantaEvents, getUsersForPeoplePage } from 'lib/prisma-cached';
import { isAuthenticated } from 'lib/prisma-ssr';
import { SecretSantaForm } from './components/secret-santa-form';
import { SecretSantaList } from './components/secret-santa-list';

export default async function SecretSantaPage() {
  const { user } = await isAuthenticated();
  const users = await getUsersForPeoplePage(user.id);
  const secretSantaEvents = await getSecretSantaEvents(user.id);

  return (
    <>
      <Heading>Secret Santa</Heading>
      <Subheading>Create and manage your Secret Santa events here.</Subheading>
      <Divider soft className="my-4" />
      <Text className="mb-4">
        Create and manage your Secret Santa events here. You can create a new
        event and invite people from your wishlists to participate.
      </Text>
      <SecretSantaForm currentUser={user} users={users} />
      <Divider soft className="my-4" />
      <Heading>Secret Santa Events</Heading>
      <SecretSantaList
        currentUser={user}
        secretSantaEvents={secretSantaEvents}
      />
    </>
  );
}
