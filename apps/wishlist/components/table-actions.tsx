'use client';
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid';
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
  Button,
  Strong,
  Text,
} from '@repo/ui';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@repo/ui/dropdown';
import { claimGift, deleteGift, unclaimGift } from 'app/actions';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { GiftWithOwner } from 'types/prisma';

export function TableActions({
  gift,
  currentUserId,
}: {
  gift: GiftWithOwner;
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);

  const handleClaim = async () => {
    toast.promise(claimGift(gift.id), {
      loading: 'Claiming...',
      success: (results) => {
        if (results?.error) throw new Error(results.error);
        return `Claimed ${gift.name}!`;
      },
      error: (err) => `Error: ${err}`,
    });
  };

  const handleUnclaim = async () => {
    toast.promise(unclaimGift(gift.id), {
      loading: 'Unclaiming...',
      success: (results) => {
        if (results?.error) throw new Error(results.error);
        return `Unclaimed ${gift.name}!`;
      },
      error: (err) => `Error: ${err}`,
    });
  };

  const handleDelete = () => {
    toast.promise(deleteGift(gift.id), {
      loading: 'Deleting...',
      success: (results) => {
        if (results?.error) throw new Error(results.error);
        return `Deleted ${gift.name}!`;
      },
      error: (err) => `Error: ${err}`,
    });
    setOpen(false);
  };

  const renderActionButtons = () => (
    <>
      {gift.ownerId !== currentUserId &&
        gift.createdById !== currentUserId &&
        !gift.claimed && (
          <Button onClick={handleClaim} color="green">
            Claim
          </Button>
        )}
      {gift.claimedById === currentUserId && (
        <Button onClick={handleUnclaim} color="red">
          Unclaim
        </Button>
      )}
      {(gift.ownerId === currentUserId ||
        gift.createdById === currentUserId) && (
        <>
          <Button href={`/gift/${gift.id}/edit`}>Edit</Button>
          <Button onClick={() => setOpen(true)} color="red">
            Delete
          </Button>
        </>
      )}
    </>
  );

  return (
    <div className="flex justify-end">
      <div className="hidden sm:flex space-x-2">{renderActionButtons()}</div>
      <div className="sm:hidden">
        <Dropdown>
          <DropdownButton plain aria-label="More options">
            <EllipsisVerticalIcon />
          </DropdownButton>
          <DropdownMenu className="right-0 origin-top-right">
            {gift.ownerId !== currentUserId &&
              gift.createdById !== currentUserId &&
              !gift.claimed && (
                <DropdownItem onClick={handleClaim}>
                  <span className="font-medium text-green-600">Claim</span>
                </DropdownItem>
              )}
            {gift.claimedById === currentUserId && (
              <DropdownItem onClick={handleUnclaim}>
                <span className="font-medium text-red-600">Unclaim</span>
              </DropdownItem>
            )}
            {(gift.ownerId === currentUserId ||
              gift.createdById === currentUserId) && (
              <>
                <DropdownItem href={`/gift/${gift.id}/edit`}>Edit</DropdownItem>
                <DropdownItem onClick={() => setOpen(true)}>
                  <span className="font-medium text-red-600">Delete</span>
                </DropdownItem>
              </>
            )}
          </DropdownMenu>
        </Dropdown>
      </div>

      <Alert open={open} onClose={() => setOpen(false)}>
        <form>
          <input name="id" type="hidden" value={gift.id} />
          <AlertTitle>Delete {gift.name}?</AlertTitle>
          <AlertDescription>
            Are you sure you want to <Strong>delete {gift.name}?</Strong>
            <Text>This cannot be undone.</Text>
          </AlertDescription>
          <AlertActions>
            <Button color="red" onClick={handleDelete}>
              Delete
            </Button>
            <Button
              outline
              onClick={() => setOpen(false)}
              ref={cancelButtonRef}
              type="button"
            >
              Close
            </Button>
          </AlertActions>
        </form>
      </Alert>
    </div>
  );
}
