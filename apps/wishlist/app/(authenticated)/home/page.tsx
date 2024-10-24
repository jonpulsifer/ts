import {
  getLatestVisibleGiftsForUserById,
  getMe,
  getPeopleForUser,
  getSecretSantaEvents,
  getVisibleGiftsForUserById,
} from 'lib/prisma-ssr';
import { redirect } from 'next/navigation';

import { HomePageTabs } from './components/HomePageTabs';

export default async function HomePage() {
  const user = await getMe();

  if (!user.hasCompletedOnboarding) {
    redirect('/onboarding');
  }

  const { gifts: latestGifts } = await getLatestVisibleGiftsForUserById(
    user.id,
  );
  const userGifts = await getVisibleGiftsForUserById(user.id);
  const { users } = await getPeopleForUser();
  const secretSantaEvents = await getSecretSantaEvents(user.id);

  const secretSantaAssignments = secretSantaEvents.map((event) => ({
    eventName: event.name,
    eventId: event.id,
    assignedTo: event.participants.find((p) => p.userId === user.id)
      ?.assignedTo,
    canJoin: event.canJoin,
  }));

  return (
    <HomePageTabs
      gifts={latestGifts}
      userGifts={userGifts}
      currentUserId={user.id}
      users={users}
      secretSantaAssignments={secretSantaAssignments.map((assignment) => ({
        ...assignment,
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
