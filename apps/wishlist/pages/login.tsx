import { useAuth } from '../components/AuthProvider';
import Loading from '../components/Loading';
import Login from '../components/Login';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

const LoginPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/people');
  }, [user, router]);

  if (loading || user) return <Loading />;

  return (
    <>
      <Head>
        <title>wishin.app | Login</title>
      </Head>
      <div className="flex flex-col h-screen items-center justify-center p-4 bg-[url('/santa.png')] bg-no-repeat bg-right-top">
        <div className="space-y-5">
          <h1 className="select-none font-title text-6xl text-white drop-shadow drop-shadow-xl">
            <span className="drop-shadow drop-shadow-2xl">wishin.app</span>
          </h1>
          <Login />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
