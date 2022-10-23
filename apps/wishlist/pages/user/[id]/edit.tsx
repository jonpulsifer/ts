import { useAuth } from '../../../components/AuthProvider';
import Card from '../../../components/Card';
import Frame from '../../../components/Frame';
import Loading from '../../../components/Loading';
import Nav from '../../../components/Nav';
import UserForm from '../../../components/UserForm';
import { auth, db, isFirebaseError } from '../../../lib/firebase-ssr';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import nookies from 'nookies';
import type { AppUser } from '../../../types';

interface Props {
  user: AppUser;
}

const ProfilePage: NextPage<Props> = ({ user }) => {
  const { user: currentUser, loading } = useAuth();
  if (!currentUser || loading) return <Loading />;
  if (!user) return <Card title="User Not Found" />;
  const { name, email } = user;

  return (
    <>
      <Head>
        <title>Edit Profile | {name}</title>
      </Head>
      <Nav title="Edit Profile" />
      <Frame>
        <Card>
          <div className="flex flex-row items-center p-4">
            <i className="fa fa-at w-10"></i>
            <a
              className="flex items-center"
              href={`mailto:${email}`}
              target="email"
            >
              {email}
            </a>
          </div>
        </Card>
        <UserForm user={user} />
      </Frame>
    </>
  );
};

export default ProfilePage;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  console.log(`getServerSideProps: ${ctx.resolvedUrl}`);
  const cookies = nookies.get(ctx);
  if (!cookies.token)
    return { redirect: { destination: '/login', permanent: false } };

  try {
    auth.verifyIdToken(cookies.token, true);
    const { id } = ctx.query;
    const snapshot = await db.doc(`/users/${id}`).get();
    const doc = snapshot.data() as AppUser;
    if (!doc) return { notFound: true };

    const user: AppUser = {
      ...doc,
      uid: snapshot.id,
    };

    return { props: { user } };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  return { redirect: { destination: '/login', permanent: false } };
};
