'use client';
import type { Gift } from '@prisma/client';
import { Button } from '@repo/ui/button';
import { claimGift, unclaimGift } from 'app/actions';
import toast from 'react-hot-toast';

export const ClaimButton = ({
  gift,
  currentUserId,
}: {
  gift: Pick<Gift, 'id' | 'name' | 'ownerId' | 'createdById' | 'claimedById'>;
  currentUserId: string;
}) => {
  if (gift.ownerId === currentUserId && gift.createdById === currentUserId) {
    return null;
  }

  if (gift.claimedById === currentUserId) {
    return (
      <Button
        color="red"
        className="h-10"
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
      className="h-10"
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
