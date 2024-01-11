import { Metadata } from 'next';
import { Suspense } from 'react';

import { getMe } from './actions';
import { Login } from './components/Login';
import { UserCard } from './components/UserCard';

export const metadata: Metadata = {
  title: 'Sandbox',
  description: 'My little application Sandbox',
};

const Home = async () => {
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
          <UserCard user={await getMe()} />
        </Suspense>
      </div>
    </div>
  );
};

export default Home;
