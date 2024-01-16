'use client';
import type { User } from '@prisma/client';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { Strong, Text } from '@repo/ui/text';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface UserCardProps {
  user: User | null;
}

export function UserCard({ user }: UserCardProps): JSX.Element | null {
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
      <div className="">
        <Text>
          <Strong>This is you.</Strong>
        </Text>
        <p className="text-sm text-gray-500">ID</p>
        <pre className="text-xs">{id}</pre>
      </div>
      <Button onClick={() => signOut({ redirect: false })}>Logout</Button>
    </Card>
  );
}
