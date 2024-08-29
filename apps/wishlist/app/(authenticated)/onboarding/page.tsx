import { Heading, Subheading, Text } from '@repo/ui';
import { getPeopleForUser } from 'lib/prisma-ssr';

import { OnboardingCarousel } from './components/OnboardingCarousel';

export default async function OnboardingPage() {
  const { user, users } = await getPeopleForUser();
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <Heading>Welcome to wishin.app!</Heading>
        <Subheading>
          Let&apos;s get ready for another magical holiday season!
        </Subheading>
        <Text>
          Take a look at this year&apos;s new features and let us know what you
          think!
        </Text>
      </div>

      <OnboardingCarousel user={user} users={users} />
    </div>
  );
}
