import { Button } from '@repo/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@repo/ui/table';
import { Strong, Text } from '@repo/ui/text';
import { GiftWithOwner } from 'types/prisma';

interface Props {
  gifts: GiftWithOwner[];
  currentUserId: string;
}

const ClaimButton = ({
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
      <Button plain>
        <div className="text-red-500">Claim</div>
      </Button>
    );
  }

  return (
    <Button plain>
      <div className="text-indigo-500">Claim</div>
    </Button>
  );
};

export function GiftTable({ gifts, currentUserId }: Props) {
  const tableRows = gifts.map((gift) => {
    return (
      <TableRow key={gift.id} href={`/gift/${gift.id}`}>
        <TableCell>
          <Text>
            <Strong>{gift.name}</Strong>
          </Text>
        </TableCell>
        <TableCell className="text-right">
          <ClaimButton
            key={`button-${gift.id}`}
            gift={gift}
            currentUserId={currentUserId}
          />
        </TableCell>
      </TableRow>
    );
  });

  return (
    <Table
      bleed
      dense
      className="[--gutter:theme(spacing.6)] sm:[--gutter:theme(spacing.8)]"
    >
      <TableBody>{tableRows}</TableBody>
    </Table>
  );
}
