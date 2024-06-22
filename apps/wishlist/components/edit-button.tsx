import { Button } from '@repo/ui/button';
import { GiftWithOwner } from 'types/prisma';

export const EditButton = ({
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
    <Button className="h-10" href={`/gift/${gift.id}/edit`}>
      Edit
    </Button>
  );
};
