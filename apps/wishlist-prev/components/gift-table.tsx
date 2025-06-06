'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import {
  InputGroup,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';
import { Input } from '@repo/ui';
import { Strong, Text } from '@repo/ui/text';
import type {
  AllVisibleGiftsForUserWithOwners,
  GiftWithOwner,
  GiftWithOwnerAndClaimedBy,
  GiftWithOwnerAndClaimedByAndCreatedBy,
  GiftWithOwnerAndWishlistIds,
} from 'lib/db/types';
import { timeAgo } from 'lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { TableActions } from './table-actions';

interface Props {
  gifts:
    | GiftWithOwner[]
    | GiftWithOwnerAndWishlistIds[]
    | GiftWithOwnerAndClaimedByAndCreatedBy[]
    | GiftWithOwnerAndClaimedBy[]
    | AllVisibleGiftsForUserWithOwners['gifts'];
  currentUserId: string;
  showGiftOwner?: boolean;
}

export function GiftTable({ gifts, currentUserId, showGiftOwner }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');

  if (!gifts || !gifts.length) {
    return (
      <Text>
        No gifts found. <Strong>Add more gifts</Strong> to this wishlist!
      </Text>
    );
  }

  const handleSort = useCallback(
    (value: string) => {
      const [column, direction] = value.split('_') as [string, string];
      const newParams = new URLSearchParams(params.toString());
      newParams.set('column', column);
      newParams.set('direction', direction);
      router.push(`?${newParams.toString()}`);
    },
    [params, router],
  );

  const column = params.get('column') || 'name';
  const direction = params.get('direction') || 'asc';

  const filteredGifts = useMemo(() => {
    if (!searchTerm) return gifts;
    return gifts.filter((gift) =>
      [
        gift.name,
        gift.url,
        gift.description,
        gift.owner?.name,
        gift.owner?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [gifts, searchTerm]);

  const sortedGifts = useMemo(() => {
    return [...filteredGifts].sort((a, b) => {
      if (column === 'name') {
        return direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (column === 'owner') {
        const aName = a.owner?.name || a.owner?.email || '';
        const bName = b.owner?.name || b.owner?.email || '';
        return direction === 'asc'
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }
      return 0;
    });
  }, [filteredGifts, column, direction]);

  const tableRows = sortedGifts.map((gift) => {
    const createdAtHumanReadable = timeAgo(gift.createdAt);
    const claimedByCurrentUser = gift.claimedById === currentUserId;
    const claimedBackgroundStyle = claimedByCurrentUser
      ? 'dark:bg-green-800/50 bg-green-200/50'
      : '';
    return (
      <TableRow
        key={gift.id}
        href={`/gift/${gift.id}`}
        className={claimedBackgroundStyle}
      >
        <TableCell className="overflow-hidden font-medium max-w-0 w-full">
          <Text className="truncate block">
            <Strong>{gift.name}</Strong>
          </Text>
          <div className="flex justify-between text-xs text-zinc-400">
            {showGiftOwner && gift.owner && (
              <span className="truncate">
                {gift.owner.name || gift.owner.email}
              </span>
            )}
            <span className="shrink-0">Created {createdAtHumanReadable}</span>
          </div>
        </TableCell>
        <TableCell className="text-right whitespace-nowrap">
          <div className="space-x-4">
            <TableActions gift={gift} currentUserId={currentUserId} />
          </div>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <InputGroup>
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className="w-full sm:w-1/2">
          <Select
            name="sort"
            onChange={(e) => handleSort(e.target.value)}
            value={`${column}_${direction}`}
            className="w-full"
          >
            <option value="name_asc">Sort by name (A-Z)</option>
            <option value="name_desc">Sort by name (Z-A)</option>
            <option value="owner_asc">Sort by owner (A-Z)</option>
            <option value="owner_desc">Sort by owner (Z-A)</option>
          </Select>
        </div>
      </div>
      <Table dense>
        <TableHead>
          <TableRow>
            <TableHeader>Gift</TableHeader>
            <TableHeader className="text-right my-4">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>{tableRows}</TableBody>
      </Table>
    </>
  );
}
