import { Metadata } from 'next';
import { Suspense } from 'react';

import { getDatabaseInfo, getMe } from './actions';
import { DatabaseCard } from './components/DatabaseCard';
import { Login } from './components/Login';
import { UserCard } from './components/UserCard';

export const metadata: Metadata = {
  title: 'Sandbox',
  description: 'My little application Sandbox',
};

const Home = async () => {
  const { connections, maxConnections, version } = await getDatabaseInfo();
  const user = await getMe();
  return (
    <div className="flex flex-col justify-center items-center gap-4 max-w-full w-full">
      <div className="flex flex-col items-center mt-4">
        <h1 className="text-4xl font-bold">Authme</h1>
        <p className="text-xs text-gray-400">
          A little application with a user model, database, and log in.
        </p>
      </div>
      <div className="flex flex-col gap-4 min-w-64 max-w-96">
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
