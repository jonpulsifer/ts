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

  const secretSantaAssignments = user.secretSantaParticipations.map(
    (participation) => ({
      eventName: participation.event.name,
      assignedTo: participation.assignedTo,
    }),
  );

  return (
    <HomePageTabs
      gifts={gifts}
      userGifts={userGifts}
      currentUserId={user.id}
      users={users}
      secretSantaAssignments={secretSantaAssignments.map((assignment) => ({
        eventName: assignment.eventName,
        assignedTo: assignment.assignedTo
          ? {
              name: assignment.assignedTo.name || '',
              email: assignment.assignedTo.email,
            }
          : null,
      }))}
    />
  );
}
