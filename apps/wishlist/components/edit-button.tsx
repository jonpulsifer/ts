import { Button } from '@repo/ui/button';
import { GiftWithOwner } from 'types/prisma';

export const EditButton = ({
  gift,
  currentUserId,
}: {
  gift: GiftWithOwner;
  currentUserId: string;
}) => {
  if (gift.ownerId !== currentUserId) {
    return null;
  }

  return (
    <Button plain href={`/gift/${gift.id}/edit`}>
      <div className="text-indigo-500">Edit</div>
    </Button>
  );
};
