'use client';
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
  Button,
  Strong,
  Text,
} from '@repo/ui';
import { deleteGift } from 'app/actions';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { GiftWithOwner } from 'types/prisma';

export const DeleteButton = ({
  gift,
  currentUserId,
}: {
  gift: GiftWithOwner;
  currentUserId: string;
}) => {
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);

  if (gift.ownerId !== currentUserId && gift.createdById !== currentUserId) {
    return null;
  }

  const handleDelete = () => {
    toast.promise(deleteGift(gift.id), {
      loading: 'Deleting...',
      success: (results) => {
        if (results?.error) throw new Error(results.error);
        return `Deleting ${gift.name}!`;
      },
      error: (err) => `Error: ${err}`,
    });
    setOpen(true);
  };

  if (!gift) return;

  return (
    <>
      <Button className="h-10" color="red" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <Alert open={open} onClose={setOpen}>
        <form>
          <input name="id" type="hidden" value={gift.id} />
          <AlertTitle>Delete {gift.name}?</AlertTitle>
          <AlertDescription>
            Are you sure you want to <Strong>delete {gift.name}?</Strong>
            <Text>This can not be undone.</Text>
          </AlertDescription>
          <AlertActions>
            <Button color="red" onClick={handleDelete}>
              Delete
            </Button>
            <Button
              outline
              onClick={() => {
                setOpen(false);
              }}
              ref={cancelButtonRef}
              type="button"
            >
              Close
            </Button>
          </AlertActions>
        </form>
      </Alert>
    </>
  );
};
