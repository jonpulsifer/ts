import { useAuth } from '../../components/AuthProvider';
import Card from '../../components/Card';
import Frame from '../../components/Frame';
import GiftForm from '../../components/GiftForm';
import Loading from '../../components/Loading';
import Nav from '../../components/Nav';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

export const NewGiftPage: NextPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [router, user]);

  if (!user || loading) return <Loading />;

  return (
    <>
      <Head>
        <title>wishin.app | Add new Gift</title>
      </Head>
      <Nav title="Add a Gift" />
      <Frame>
        <Card>
          <GiftForm />
        </Card>
      </Frame>
    </>
  );
};

export default NewGiftPage;
