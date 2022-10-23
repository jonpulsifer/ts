import { useAuth } from '../../../components/AuthProvider';
import Card, { CardAction } from '../../../components/Card';
import Frame from '../../../components/Frame';
import GiftList from '../../../components/GiftList';
import Loading from '../../../components/Loading';
import Nav from '../../../components/Nav';
import { auth, db, isFirebaseError } from '../../../lib/firebase-ssr';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import nookies from 'nookies';
import type { AppUser, Gift } from '../../../types';

interface Props {
  user: AppUser;
  gifts: Gift[];
}

const ProfilePage: NextPage<Props> = ({ user: appUser, gifts }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  if (!user || loading) return <Loading />;

  const isUserProfile = user?.uid === appUser.uid;

  if (!user) return <Card title="User Not Found" />;

  const {
    uid,
    name,
    email,
    address,
    shirt_size,
    shoe_size,
    pant_size,
    gift_theme,
  } = appUser;
  const fields = [
    {
      icon: 'fa-signature',
      content: name,
    },
    {
      icon: 'fa-at',
      content: email,
    },
    {
      icon: 'fa-location-dot',
      content: address,
    },
    {
      icon: 'fa-layer-group',
      content: gift_theme,
    },
    {
      icon: 'fa-socks',
      content: shoe_size,
    },
    {
      icon: 'fa-person-running',
      content: pant_size,
    },
    {
      icon: 'fa-shirt',
      content: shirt_size,
    },
  ];

  const fieldsMarkup = fields.map((field, i) => {
    if (!field.content) return null;
    return (
      <div
        key={`${field.icon}-${i}`}
        className="flex flex-row items-center p-4"
      >
        <i className={`fa ${field.icon} w-10 shrink-0 text-center`}></i>
        {field.content}
      </div>
    );
  });

  const actions: CardAction[] = [];
  if (isUserProfile)
    actions.push(
      {
        icon: 'fa-user-edit',
        title: 'Edit Profile',
        fn: () => router.push(`/user/${uid}/edit`).then(() => {}),
      },
      {
        title: 'Join a Family',
        icon: 'fa-people-roof',
        fn: () => router.push('/family/join'),
      },
    );

  return (
    <>
      <Head>
        <title>{`Profile | ${name || email}`}</title>
      </Head>
      <Nav title={`${name || email}'s Profile`} />
      <Frame>
        <Card action={actions}>{fieldsMarkup}</Card>
        <GiftList
          title={isUserProfile ? undefined : `${name || email}'s Wishlist`}
          gifts={gifts}
        />
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
    const { uid: tokenUid } = await auth.verifyIdToken(cookies.token, true);
    const { id } = ctx.query;
    const snapshot = await db.doc(`/users/${id}`).get();
    const doc = snapshot.data() as AppUser;
    const uid = snapshot.id;

    if (!doc) return { notFound: true };

    const user: AppUser = {
      ...doc,
      uid,
    };

    const query =
      uid === tokenUid
        ? db.collection('gifts').where('owner', '==', uid)
        : db
            .collection('gifts')
            .where('owner', '==', uid)
            .where('claimed_by', 'in', [null, '']);

    const gifts: Gift[] = [];
    const docs = await query.get();

    docs.forEach((doc) => {
      gifts.push({
        ...(doc.data() as Gift),
        id: doc.id,
      });
    });

    return { props: { user, gifts } };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  return { redirect: { destination: '/login', permanent: false } };
};
