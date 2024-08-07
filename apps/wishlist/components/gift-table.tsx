'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/table';
import { Strong, Text } from '@repo/ui/text';
import { GiftWithOwner, GiftWithOwnerAndWishlistIds } from 'types/prisma';

import { TableActions } from './table-actions';

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
        <TableCell className="overflow-hidden font-medium">
          <Text className="truncate">
            <Strong>{gift.name}</Strong>
          </Text>
          {showGiftOwner && gift.owner && (
            <span className="text-xs text-zinc-400">{gift.owner.name}</span>
          )}
        </TableCell>
        <TableCell className="text-right">
          <div className="space-x-4">
            <TableActions gift={gift} currentUserId={currentUserId} />
          </div>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <Table dense>
      <TableHead>
        <TableRow>
          <TableHeader>Wishlist</TableHeader>
          <TableHeader className="text-right my-4">Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>{tableRows}</TableBody>
    </Table>
  );
}
