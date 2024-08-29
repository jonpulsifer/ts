import { Heading, Subheading } from '@repo/ui';
import { getPeopleForUser } from 'lib/prisma-ssr';

import { OnboardingCarousel } from './OnboardingCarousel';

export default async function OnboardingPage() {
  const { user, users } = await getPeopleForUser();
  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="text-center">
        <Heading className="text-3xl sm:text-4xl mb-2 text-zinc-800 dark:text-zinc-200">
          Welcome to wishin.app!
        </Heading>
        <Subheading className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-400">
          Let&apos;s get you started on your wishlist journey
        </Subheading>
      </div>

      <OnboardingCarousel user={user} users={users} />
    </div>
  );
}
