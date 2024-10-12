import type {
  SecretSantaEvent,
  SecretSantaParticipant,
  User,
} from '@prisma/client';
import { Button, Dialog, Text } from '@repo/ui';

type SecretSantaEventWithParticipants = SecretSantaEvent & {
  participants: (SecretSantaParticipant & {
    user: User;
    assignedTo: User | null;
  })[];
};

interface SecretSantaDetailsProps {
  event: SecretSantaEventWithParticipants;
  currentUser: User;
  onClose: () => void;
}

export function SecretSantaDetails({
  event,
  currentUser,
  onClose,
}: SecretSantaDetailsProps) {
  const currentUserParticipant = event.participants.find(
    (p) => p.userId === currentUser.id,
  );

  return (
    <Dialog open={true} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">{event.name}</h2>
        <Text className="mb-4">
          Created on: {new Date(event.createdAt).toLocaleDateString()}
        </Text>

        {currentUserParticipant?.assignedToId ? (
          <div className="mb-4">
            <Text className="font-bold">You are Secret Santa for:</Text>
            <Text>
              {currentUserParticipant.assignedTo?.name ||
                currentUserParticipant.assignedTo?.email}
            </Text>
          </div>
        ) : (
          <Text className="mb-4">
            You haven't been assigned a Secret Santa recipient yet.
          </Text>
        )}

        <Button onClick={onClose}>Close</Button>
      </div>
    </Dialog>
  );
}
