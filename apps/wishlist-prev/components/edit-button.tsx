import type { Gift } from '@prisma/client';
import { Button } from '@repo/ui/button';

export const EditButton = ({
  gift,
  currentUserId,
}: {
  gift: Pick<Gift, 'id' | 'ownerId' | 'createdById'>;
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
