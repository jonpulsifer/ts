'use client';
import { Table, TableBody, TableCell, TableRow } from '@repo/ui/table';
import { Strong, Text } from '@repo/ui/text';
import { ClaimButton } from 'components/claim-button';
import { GiftWithOwner, GiftWithOwnerAndWishlistIds } from 'types/prisma';

interface Props {
  gifts: GiftWithOwner[] | GiftWithOwnerAndWishlistIds[];
  currentUserId: string;
  showGiftOwner?: boolean;
}

export function GiftTable({ gifts, currentUserId, showGiftOwner }: Props) {
  if (!gifts || !gifts.length) {
    return (
      <Text>
        No gifts found. <Strong>Add more gifts</Strong> to this wishlist!
      </Text>
    );
  }
  const tableRows = gifts.map((gift) => {
    return (
      <TableRow key={gift.id} href={`/gift/${gift.id}`}>
        <TableCell>
          <Text>
            <Strong>{gift.name}</Strong>
          </Text>
          {showGiftOwner && gift.owner && (
            <span className="text-xs text-slate-400">{gift.owner.name}</span>
          )}
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
