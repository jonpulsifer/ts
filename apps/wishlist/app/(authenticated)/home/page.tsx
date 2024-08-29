import { Divider, Heading, Subheading } from '@repo/ui';
import { auth } from 'app/auth';
import {
  getGiftsWithOwnerByUserId,
  getLatestVisibleGiftsForUserById,
  getUserOnboardingStatus,
} from 'lib/prisma-ssr';
import { redirect } from 'next/navigation';

import { HomePageTabs } from './HomePageTabs';

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) return null;

  const hasCompletedOnboarding = await getUserOnboardingStatus(session.user.id);
  if (!hasCompletedOnboarding) {
    redirect('/onboarding');
  }

  const { gifts } = await getLatestVisibleGiftsForUserById(session.user.id);
  const userGifts = await getGiftsWithOwnerByUserId(session.user.id);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="text-center">
        <Heading className="text-3xl sm:text-4xl mb-2">
          Welcome to wishin.app
        </Heading>
        <Subheading className="text-xl sm:text-2xl text-gray-600">
          A wishlist app for friends and family, powered by AI
        </Subheading>
      </div>

      <Divider className="my-6" soft />

      <HomePageTabs
        gifts={gifts}
        userGifts={userGifts}
        currentUserId={session.user.id}
      />
    </div>
  );
}
