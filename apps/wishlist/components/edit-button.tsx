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

  return <Button href={`/gift/${gift.id}/edit`}>Edit</Button>;
};
