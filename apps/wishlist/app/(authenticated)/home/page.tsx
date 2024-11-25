import {
  getLatestVisibleGiftsForUserById,
  getSecretSantaEvents,
  getUsersWithGiftCount,
  getVisibleGiftsForUserById,
} from 'lib/prisma-cached';
import { isAuthenticated } from 'lib/prisma-ssr';

import { HomePageTabs } from './components/HomePageTabs';

export default async function HomePage() {
  const { user } = await isAuthenticated();

  const userGifts = await getVisibleGiftsForUserById(user.id, user.id);
  const latestGifts = await getLatestVisibleGiftsForUserById(user.id);
  const usersWithGiftCount = await getUsersWithGiftCount(user.id);
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
      usersWithGiftCount={usersWithGiftCount}
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
