import Frame from '../components/Frame';
import Nav from '../components/Nav';
import UserList from '../components/UserList';
import { FieldPath } from 'firebase-admin/firestore';
import { auth, db, isFirebaseError } from '../lib/firebase-ssr';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import nookies from 'nookies';
import React, { useEffect } from 'react';
import type { AppUser } from '../types';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/router';
import Loading from '../components/Loading';

interface Props {
  user: AppUser;
  users: AppUser[];
}

const PeoplePage: NextPage<Props> = ({ users, user }) => {
  const { user: currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('/people, no user, pushing to login (client)')
    if (!currentUser) router.push('/login');
  }, [currentUser, router]);

  if (!users || loading) return <Loading />;

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <Nav title="People" />
      <Frame>
        <UserList users={users} user={user} />
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
    const doc = await db.doc(`/users/${uid}`).get();
    const user: AppUser = {
      ...(doc.data() as AppUser),
      uid: doc.id,
    };

    if (!user.families || !user.families.length)
      return { props: { users: [] } };

    const snapshot = await db
      .collection('users')
      .where(FieldPath.documentId(), '!=', uid)
      .where('families', 'array-contains-any', user.families)
      .get();

    const users: AppUser[] = [];
    for (const doc of snapshot.docs) {
      users.push({
        ...(doc.data() as AppUser),
        uid: doc.id,
      });
    }
    return { props: { users, user } };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  return { redirect: { destination: '/login', permanent: false } };
};

export default PeoplePage;
