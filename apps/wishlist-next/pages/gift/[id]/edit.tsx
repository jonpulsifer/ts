import { useAuth } from '../../../components/AuthProvider';
import Card from '../../../components/Card';
import Frame from '../../../components/Frame';
import GiftForm from '../../../components/GiftForm';
import Loading from '../../../components/Loading';
import Nav from '../../../components/Nav';
import { auth, db, isFirebaseError } from '../../../lib/firebase-ssr';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import nookies from 'nookies';
import type { Gift } from '../../../types';

interface Props {
  gift: Gift;
}

const EditGiftPage: NextPage<Props> = ({ gift }) => {
  const { user, loading } = useAuth();
  if (!user || loading) return <Loading />;

  if (!gift) return <Card title="Gift Not Found" />;
  return (
    <>
      <Head>
        <title>wishin.app | Edit {gift.name}</title>
      </Head>
      <Nav title={gift.name} />
      <Frame>
        <Card>
          <GiftForm gift={gift} />
        </Card>
      </Frame>
    </>
  );
};

export default EditGiftPage;

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
    const snapshot = await db.doc(`/gifts/${id}`).get();
    const doc = snapshot.data() as Gift;
    if (snapshot.id !== id) throw 'gift id mismatch';
    if (!doc) return { notFound: true };
    const gift: Gift = {
      ...doc,
      id: snapshot.id,
    };
    return { props: { gift } };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  return { redirect: { destination: '/login', permanent: false } };
};
