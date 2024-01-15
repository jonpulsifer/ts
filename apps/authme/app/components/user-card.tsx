'use client';
import type { User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card } from '@repo/ui/card';

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
      <div className="p-4">
        <p className="font-bold">This is you.</p>
        <p className="text-sm text-gray-500">ID</p>
        <pre className="text-xs">{id}</pre>
      </div>
    </Card>
  );
}
