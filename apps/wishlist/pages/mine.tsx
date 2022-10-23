import { useAuth } from '../components/AuthProvider';
import Frame from '../components/Frame';
import GiftList from '../components/GiftList';
import Loading from '../components/Loading';
import Nav from '../components/Nav';
import { auth, db, isFirebaseError } from '../lib/firebase-ssr';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import nookies from 'nookies';
import React from 'react';
import { Gift } from '../types';

interface Props {
  gifts: Gift[];
}

const MyGiftsPage: NextPage<Props> = ({ gifts }) => {
  const { user, loading } = useAuth();
  if (!user || loading) return <Loading />;

  return (
    <>
      <Head>
        <title>My Wishlist</title>
      </Head>
      <Nav title="My Wishlist" />
      <Frame>
        <GiftList gifts={gifts} />
      </Frame>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  console.log(`getServerSideProps: ${ctx.resolvedUrl}`);
  const cookies = nookies.get(ctx);
  if (!cookies.token)
    return { redirect: { destination: '/login', permanent: false } };

  try {
    const { uid } = await auth.verifyIdToken(cookies.token, true);
    const snapshot = await db
      .collection('gifts')
      .where('owner', '==', uid)
      .get();

    const gifts: Gift[] = [];
    for (const doc of snapshot.docs) {
      gifts.push({
        ...(doc.data() as Gift),
        id: doc.id,
      });
    }
    return { props: { gifts } };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  return { redirect: { destination: '/login', permanent: false } };
};

export default MyGiftsPage;
