'use client';
import { User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card } from 'ui';

interface Props {
  user: User | null;
}

export const UserCard = ({ user }: Props) => {
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
    <Card title={name} subtitle={`${email}`}>
      <div className="p-4">
        <pre>{id}</pre>
      </div>
    </Card>
  );
};
