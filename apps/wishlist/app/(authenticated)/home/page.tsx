import {
  getGiftsWithOwnerByUserId,
  getLatestVisibleGiftsForUserById,
  getMe,
  getPeopleForUser,
} from 'lib/prisma-ssr';
import { redirect } from 'next/navigation';

import { HomePageTabs } from './components/HomePageTabs';

export default async function HomePage() {
  const user = await getMe();

  if (!user.hasCompletedOnboarding) {
    redirect('/onboarding');
  }

  const { gifts } = await getLatestVisibleGiftsForUserById(user.id);
  const userGifts = await getGiftsWithOwnerByUserId(user.id);
  const { users } = await getPeopleForUser();

  return (
    <HomePageTabs
      gifts={gifts}
      userGifts={userGifts}
      currentUserId={user.id}
      users={users}
    />
  );
}
