import { Divider, Heading, Subheading, Text } from '@repo/ui';
import { getMe, getPeopleForUser, getSecretSantaEvents } from 'lib/prisma-ssr';
import { SecretSantaForm } from './components/secret-santa-form';
import { SecretSantaList } from './components/secret-santa-list';

export default async function SecretSantaPage() {
  const user = await getMe();
  const { users } = await getPeopleForUser();
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
