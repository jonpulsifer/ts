import { useAuth } from '../components/AuthProvider';
import Frame from '../components/Frame';
import GiftList from '../components/GiftList';
import Loading from '../components/Loading';
import Nav from '../components/Nav';
import { FieldPath } from 'firebase-admin/firestore';
import { auth, db, isFirebaseError } from '../lib/firebase-ssr';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import nookies from 'nookies';
import React from 'react';
import type { AppUser, Gift } from '../types';

interface Props {
  gifts: Gift[];
}

const GiftsPage: NextPage<Props> = ({ gifts }) => {
  const { user, loading } = useAuth();
  if (!user || loading) return <Loading />;

  return (
    <>
      <Head>
        <title>wishin.app | Gift List</title>
      </Head>
      <Nav title="Gift List" />
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

    const user = (await db.doc(`/users/${uid}`).get()).data() as AppUser;
    if (!user.families || !user.families.length)
      return { props: { gifts: [] } };

    const userSnapshot = await db
      .collection('users')
      .where(FieldPath.documentId(), '!=', uid)
      .where('families', 'array-contains-any', user.families)
      .get();

    const familyUsers = userSnapshot.docs;
    const familyUserIds = familyUsers.map((u) => u.id).filter((u) => u !== uid);

    const snapshot = await db
      .collection('gifts')
      .where('claimed_by', '==', '')
      .where('owner', 'in', familyUserIds)
      .get();

    const gifts: Gift[] = [];
    for (const doc of snapshot.docs) {
      const user = familyUsers.find((u) => u.id === doc.get('owner'));
      const owner_name = user?.get('name') || user?.get('email');
      gifts.push({
        ...(doc.data() as Gift),
        id: doc.id,
        owner_name,
      });
    }
    return { props: { gifts } };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  return { redirect: { destination: '/login', permanent: false } };
};

export default GiftsPage;
