'use client';
import { Button } from '@repo/ui/button';
import { deleteGift } from 'app/actions';
import toast from 'react-hot-toast';
import { GiftWithOwner } from 'types/prisma';

export const DeleteButton = ({
  gift,
  currentUserId,
}: {
  gift: GiftWithOwner;
  currentUserId: string;
}) => {
  if (gift.ownerId !== currentUserId && gift.createdById !== currentUserId) {
    return null;
  }

  return (
    <Button
      color="red"
      onClick={() => {
        toast.promise(deleteGift(gift.id), {
          loading: 'Deleting...',
          success: (results) => {
            if (results?.error) throw new Error(results.error);
            return `Deleting ${gift.name}!`;
          },
          error: (err) => `Error: ${err}`,
        });
      }}
    >
      Delete
    </Button>
  );
};
