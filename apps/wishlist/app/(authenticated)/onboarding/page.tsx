import { Heading, Text } from '@repo/ui';
import { getSession } from 'app/auth';

import { getPeopleForNewGiftModal } from 'lib/db/queries-cached';
import { OnboardingCarousel } from './components/OnboardingCarousel';

export default async function OnboardingPage() {
  const { user } = await getSession();
  const users = await getPeopleForNewGiftModal(user.id);
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <Heading>Welcome to wishin.app!</Heading>
        <Text>
          Take a look at this year&apos;s new features and let us know what you
          think!
        </Text>
      </div>

      <OnboardingCarousel currentUser={user} users={users} />
    </div>
  );
}
