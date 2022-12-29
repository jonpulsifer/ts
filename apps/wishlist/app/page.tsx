'use client';

import { useAuth } from '../components/AuthProvider';
import Loading from './loading';
import Login from './login/page';

import { useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';

const Home = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/people');
  }, [router, user]);
  if (loading) return <Loading />;
  return (
    <Suspense fallback={<Loading />}>
      <Login />
    </Suspense>
  );
};

export default Home;
