import { Button } from '@repo/ui/button';
import { claimGift, unclaimGift } from 'app/actions';
import toast from 'react-hot-toast';
import { GiftWithOwner } from 'types/prisma';

export const ClaimButton = async ({
  gift,
  currentUserId,
}: {
  gift: GiftWithOwner;
  currentUserId: string;
}) => {
  if (gift.ownerId === currentUserId) {
    return null;
  }

  if (gift.claimedById === currentUserId) {
    return (
      <Button
        plain
        onClick={async () => {
          const results = await unclaimGift(gift.id);
          if (results?.error) {
            toast.error(results.error);
          } else {
            toast.success(`Unclaimed ${gift.name}!`);
          }
        }}
      >
        <div className="text-red-500">Unclaim</div>
      </Button>
    );
  }

  return (
    <Button
      plain
      onClick={async () => {
        const results = await claimGift(gift.id);
        if (results?.error) {
          toast.error(results.error);
        } else {
          toast.success(`Claimed ${gift.name}!`);
        }
      }}
    >
      <div className="text-indigo-500">Claim</div>
    </Button>
  );
};
