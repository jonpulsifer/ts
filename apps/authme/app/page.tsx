import { Text } from '@repo/ui/text';
import type { Metadata } from 'next';
import { Suspense } from 'react';

import { getDatabaseInfo, getMe } from './actions';
import { DatabaseCard } from './components/database-card';
import { Login } from './components/login';
import { UserCard } from './components/user-card';

export const metadata: Metadata = {
  title: 'Sandbox',
  description: 'My little application Sandbox',
};

const Home = async () => {
  const { connections, maxConnections, version } = await getDatabaseInfo();
  const user = await getMe();
  return (
    <div className="flex flex-col justify-center items-center gap-4 max-w-full w-full">
      <div className="flex flex-col items-center mx-4 mt-2">
        <h1 className="text-4xl font-bold">Authme</h1>
        <Text>
          A little application with a user model, database, and log in.
        </Text>
      </div>
      <div className="flex flex-col gap-4 max-w-lg">
        <Login />
        <Suspense fallback={<div>Suspended...</div>}>
          <UserCard user={user} />
        </Suspense>
        <Suspense fallback={<div>Suspended...</div>}>
          <DatabaseCard
            connections={connections}
            maxConnections={maxConnections}
            version={version}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default Home;
