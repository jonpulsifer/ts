'use client';

import {
  Avatar,
  Badge,
  Input,
  Strong,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@repo/ui';
import { useState } from 'react';
import type { UserWithGifts } from 'types/prisma';

export function UserTable({ users }: { users: UserWithGifts[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  const tableRows = filteredUsers.map((user) => {
    const displayName = user.name || user.email || 'Unknown';
    const initials = displayName.charAt(0).toUpperCase();
    const giftCount = user.gifts?.length || 0;

    return (
      <TableRow key={user.id} href={`/user/${user.id}`}>
        <TableCell>
          <div className="flex items-center gap-4">
            <Avatar
              square
              src={user.image}
              initials={!user.image ? initials : undefined}
              className="size-10 sm:size-12 bg-zinc-200 dark:bg-zinc-950 dark:text-indigo-500"
            />
            <div>
              <Text>
                <Strong>{displayName}</Strong>
              </Text>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge color={giftCount > 0 ? 'green' : 'zinc'}>
            {giftCount} {giftCount === 1 ? 'Gift' : 'Gifts'}
          </Badge>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <div>
      <Input
        type="search"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <Table
        bleed
        dense
        className="[--gutter:theme(spacing.6)] sm:[--gutter:theme(spacing.8)]"
      >
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Gifts</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>{tableRows}</TableBody>
      </Table>
    </div>
  );
}
