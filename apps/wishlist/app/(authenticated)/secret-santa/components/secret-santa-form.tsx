'use client';

import type { User } from '@prisma/client';
import { Button, Field, Input, Label } from '@repo/ui';
import { Checkbox, CheckboxField } from '@repo/ui/checkbox';
import { createSecretSantaEvent } from 'app/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface SecretSantaFormProps {
  currentUser: User;
  users: User[];
}

export function SecretSantaForm({ currentUser, users }: SecretSantaFormProps) {
  const [eventName, setEventName] = useState('');
  const [participants, setParticipants] = useState<Set<string>>(new Set());
  const router = useRouter();

  const handleParticipantToggle = (userId: string) => {
    setParticipants((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || participants.size < 3) {
      toast.error('Please provide an event name and at least 3 participants');
      return;
    }

    try {
      await createSecretSantaEvent({
        name: eventName,
        createdById: currentUser.id,
        participantIds: Array.from(participants),
      });
      toast.success('Secret Santa event created!');
      router.refresh();
      setEventName('');
      setParticipants(new Set());
    } catch (error) {
      toast.error('Failed to create Secret Santa event');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field>
        <Label>Event Name</Label>
        <Input
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Christmas 2024"
          required
        />
      </Field>
      <Field>
        <Label>Participants</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
          {users.map((user) => (
            <CheckboxField key={user.id}>
              <Checkbox
                name={`participant-${user.id}`}
                checked={participants.has(user.id)}
                onChange={() => handleParticipantToggle(user.id)}
              />
              <Label className="truncate">{user.name || user.email}</Label>
            </CheckboxField>
          ))}
        </div>
      </Field>
      <Button type="submit">Create Secret Santa Event</Button>
    </form>
  );
}
