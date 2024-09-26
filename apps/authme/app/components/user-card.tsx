'use client';
import type { User } from '@prisma/client';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/table';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface UserCardProps {
  user: User | null;
}

export function UserCard({ user }: UserCardProps) {
  const [currentUser, setCurrentUser] = useState(user);
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      setCurrentUser(null);
    }
  }, [status]);
  if (!currentUser) {
    return null;
  }

  const { email, name, id } = currentUser;
  return (
    <Card subtitle={email} title={name}>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>ID</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{id}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Button onClick={() => signOut({ redirect: false })}>Logout</Button>
    </Card>
  );
}
