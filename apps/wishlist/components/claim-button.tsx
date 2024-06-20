'use client';
import { Button } from '@repo/ui/button';
import { claimGift, unclaimGift } from 'app/actions';
import toast from 'react-hot-toast';
import { GiftWithOwner } from 'types/prisma';

export const ClaimButton = ({
  gift,
  currentUserId,
}: {
  gift: GiftWithOwner;
  currentUserId: string;
}) => {
  if (gift.ownerId === currentUserId || gift.createdById === currentUserId) {
    return null;
  }

  if (gift.claimedById === currentUserId) {
    return (
      <Button
        color="red"
        onClick={() => {
          toast.promise(unclaimGift(gift.id), {
            loading: 'Unclaiming...',
            success: (results) => {
              if (results?.error) throw new Error(results.error);
              return `Unclaimed ${gift.name}!`;
            },
            error: (err) => `Error: ${err}`,
          });
        }}
      >
        Unclaim
      </Button>
    );
  }

  return (
    <Button
      color="green"
      onClick={() => {
        toast.promise(claimGift(gift.id), {
          loading: 'Claiming...',
          success: (results) => {
            if (results?.error) throw new Error(results.error);
            return `Claimed ${gift.name}!`;
          },
          error: (err) => `Error: ${err}`,
        });
      }}
    >
      Claim
    </Button>
  );
};
