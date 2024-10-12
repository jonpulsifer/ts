'use client';

import type {
  Prisma,
  SecretSantaEvent,
  SecretSantaParticipant,
  User,
} from '@prisma/client';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@repo/ui';
import { assignSecretSanta } from 'app/actions';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { SecretSantaDetails } from './secret-santa-details';

interface SecretSantaListProps {
  currentUser: User;
  secretSantaEvents: Prisma.SecretSantaEventGetPayload<{
    include: { participants: true };
  }>[];
}

type SecretSantaEventWithParticipants = SecretSantaEvent & {
  participants: (SecretSantaParticipant & {
    user: User;
    assignedTo: User | null;
  })[];
};

export function SecretSantaList({
  currentUser,
  secretSantaEvents: events,
}: SecretSantaListProps) {
  const [selectedEvent, setSelectedEvent] =
    useState<SecretSantaEventWithParticipants | null>(null);

  const handleAssign = async (eventId: string) => {
    try {
      await assignSecretSanta(eventId);
      toast.success('Secret Santa assignments completed!');
    } catch (error) {
      toast.error('Failed to assign Secret Santa');
    }
  };

  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Event Name</TableHeader>
            <TableHeader>Created At</TableHeader>
            <TableHeader>Participants</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.name}</TableCell>
              <TableCell>
                {new Intl.DateTimeFormat('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                }).format(new Date(event.createdAt))}
              </TableCell>
              <TableCell>{event.participants.length}</TableCell>
              <TableCell>
                {event.participants.some((p) => p.assignedToId)
                  ? 'Assigned'
                  : 'Not Assigned'}
              </TableCell>
              <TableCell className="flex gap-2">
                <Button
                  onClick={() =>
                    setSelectedEvent(
                      event as unknown as SecretSantaEventWithParticipants,
                    )
                  }
                >
                  View Details
                </Button>
                {event.createdById === currentUser.id && (
                  <Button
                    onClick={() => handleAssign(event.id)}
                    disabled={event.participants.some((p) => p.assignedToId)}
                  >
                    {event.participants.some((p) => p.assignedToId)
                      ? 'Reassign'
                      : 'Assign'}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedEvent && (
        <SecretSantaDetails
          event={selectedEvent}
          currentUser={currentUser}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
