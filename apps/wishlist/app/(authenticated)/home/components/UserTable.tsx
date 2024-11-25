'use client';

import type { User } from '@prisma/client';
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
import type { UserWithGiftCount } from 'lib/db/types';
import { useState } from 'react';

export function UserTable({
  users,
}: {
  users: UserWithGiftCount[];
}) {
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
          <Badge color={user._count.gifts > 0 ? 'green' : 'zinc'}>
            {user._count.gifts} {user._count.gifts === 1 ? 'Gift' : 'Gifts'}
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
