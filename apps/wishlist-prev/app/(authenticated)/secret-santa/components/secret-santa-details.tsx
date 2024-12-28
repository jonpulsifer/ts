import type {
  SecretSantaEvent,
  SecretSantaParticipant,
  User,
} from '@prisma/client';
import { Button, Dialog, Heading, Subheading, Text } from '@repo/ui';

type SecretSantaEventWithParticipants = SecretSantaEvent & {
  participants: (SecretSantaParticipant & {
    user: User;
    assignedTo: User | null;
  })[];
};

interface SecretSantaDetailsProps {
  event: SecretSantaEventWithParticipants;
  currentUser: Pick<User, 'id'>;
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
      <div className="max-w-md mx-auto">
        <Heading>{event.name}</Heading>
        <Text className="text-sm text-gray-500 mb-6">
          Created on: {new Date(event.createdAt).toLocaleDateString()}
        </Text>

        {currentUserParticipant?.assignedToId ? (
          <div className="mb-6">
            <Text className="font-semibold mb-2">
              You are Secret Santa for:
            </Text>
            <Text className="text-lg">
              {currentUserParticipant.assignedTo?.name ||
                currentUserParticipant.assignedTo?.email}
            </Text>
          </div>
        ) : (
          <div className="mb-6">
            <Text className="mb-4">Assignments haven't been made yet!</Text>
            <Subheading className="mb-2">Participants:</Subheading>
            <div className="grid grid-cols-2 gap-2">
              {event.participants.map((participant) => (
                <Text key={participant.userId} className="text-sm">
                  {participant.user.name || participant.user.email}
                </Text>
              ))}
            </div>
          </div>
        )}

        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </Dialog>
  );
}
