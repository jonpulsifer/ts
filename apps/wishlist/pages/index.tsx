import { useAuth } from '../components/AuthProvider';
import Loading from '../components/Loading';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import Login from './login';

const Home: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/people');
  }, [user, router]);

  if (loading || user) return <Loading />;

  return (
    <>
      <Head>
        <title>wishin.app</title>
      </Head>
      <Login />
    </>
  );
};

export default Home;
