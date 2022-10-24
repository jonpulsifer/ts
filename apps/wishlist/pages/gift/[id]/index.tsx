import { useAuth } from '../../../components/AuthProvider';
import Card from '../../../components/Card';
import Frame from '../../../components/Frame';
import Loading from '../../../components/Loading';
import Nav from '../../../components/Nav';
import { deleteDoc, doc, FirestoreError, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { auth, db as ssr, isFirebaseError } from '../../../lib/firebase-ssr';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import nookies from 'nookies';
import { toast } from 'react-toastify';
import type { Gift } from '../../../types';

interface Props {
  gift: Gift;
}

const GiftPage: NextPage<Props> = ({ gift }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (!user || loading) return <Loading />;
  if (!gift) return <Card title="Gift Not Found" />;

  const { name, notes, url } = gift;

  const notesContent = notes
    ? notes
    : `${gift.owner_name} hasn't added any notes for this gift.`;

  const ToastMarkup = ({ gift }: { gift: Gift }) => {
    return (
      <>
        <button className="flex flex-row items-center space-x-4 h-max">
          <div className="flex h-max">
            Are you sure you want to delete {gift.name}?
          </div>
          <div
            onClick={() => handleDelete(gift)}
            className="flex pl-6 items-center border-l border-gray-300 h-16 hover:text-red-800 hover:drop-shadow transition ease-in-out duration-200 text-red-600 text-xs font-semibold uppercase"
          >
            delete
          </div>
        </button>
      </>
    );
  };

  const handleConfirmDelete = (gift: Gift) => {
    toast.error(<ToastMarkup gift={gift} />, {
      position: toast.POSITION.BOTTOM_CENTER,
      icon: (
        <i className="fa fa-trash-can text-xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-red-600 to-red-600" />
      ),
    });
  };

  const handleDelete = (gift: Gift) => {
    const ref = doc(db, 'gifts', gift.id);
    deleteDoc(ref)
      .then(() => {
        toast.success(`Deleted ${gift.name}`, {
          position: toast.POSITION.TOP_CENTER,
        });
        router.push('/mine');
      })
      .catch((error: FirestoreError) => {
        toast.error(error.message, {
          position: toast.POSITION.TOP_CENTER,
        });
      });
  };

  const handleClaim = (gift: Gift) => {
    const ref = doc(db, 'gifts', gift.id);
    setDoc(ref, { claimed_by: user?.uid }, { merge: true })
      .then(() => {
        toast.success(`Claimed ${gift.name}`, {
          position: toast.POSITION.TOP_CENTER,
        });
        router.push('/gifts');
      })
      .catch((error: FirestoreError) => {
        toast.error(error.message, {
          position: toast.POSITION.TOP_CENTER,
        });
      });
  };

  const handleUnclaim = (gift: Gift) => {
    const ref = doc(db, 'gifts', gift.id);
    setDoc(ref, { claimed_by: '' }, { merge: true })
      .then(() => {
        toast.success(`Unclaimed ${gift.name}`, {
          position: toast.POSITION.TOP_CENTER,
        });
        router.push('/gifts');
      })
      .catch((error: FirestoreError) => {
        toast.error(error.message, {
          position: toast.POSITION.TOP_CENTER,
        });
      });
  };

  const giftAction = () => {
    if (gift.owner === user.uid)
      return [
        {
          fn: () => router.push(`/gift/${gift.id}/edit`),
          icon: 'fa-pencil',
          title: 'Edit Gift',
        },
        {
          fn: () => handleConfirmDelete(gift),
          icon: 'fa-trash-can',
          title: 'Delete Gift',
          danger: true,
        },
      ];
    if (gift.claimed_by && gift.claimed_by !== user.uid) return undefined;
    if (gift.claimed_by === user.uid) {
      return {
        fn: () => handleUnclaim(gift),
        icon: 'fa-minus-square',
        title: 'Unclaim Gift',
      };
    }
    return {
      fn: () => handleClaim(gift),
      icon: 'fa-plus-square',
      title: 'Claim Gift',
    };
  };

  return (
    <>
      <Head>
        <title>wishin.app | {gift.name}</title>
      </Head>
      <Nav title={gift.name} />
      <Frame>
        <Card title={name} subtitle={gift.owner_name} action={giftAction()}>
          <div className="p-4">
            <div className="flex flex-col space-y-4 truncate">
              {url ? (
                <div className="flex flex-col sm:flex-row">
                  <div className="flex flex-row sm:shrink-0 sm:w-24 items-center space-x-2 mb-2 text-gray-600">
                    <i className="fa fa-link text-sm" />
                    <p className="font-semibold text-lg">Link</p>
                  </div>
                  <div className="truncate">
                    <Link
                      className="text-lg text-blue-600 font-medium hover:text-blue-600"
                      target="gift"
                      href={url}
                    >
                      {url}
                    </Link>
                  </div>
                </div>
              ) : null}
              <div className="flex flex-col sm:flex-row items-start">
                <div className="flex flex-row sm:shrink-0 sm:w-24 items-center space-x-2 mb-2 text-gray-600">
                  <i className="fa fa-feather text-sm" />
                  <p className="font-semibold text-lg">Notes</p>
                </div>
                <div className="whitespace-pre-line">{notesContent}</div>
              </div>
            </div>
          </div>
        </Card>
      </Frame>
    </>
  );
};

export default GiftPage;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  console.log(`getServerSideProps: ${ctx.resolvedUrl}`);
  const cookies = nookies.get(ctx);
  if (!cookies.token)
    return { redirect: { destination: '/login', permanent: false } };

  auth.verifyIdToken(cookies.token, true).catch((e) => {
    console.log(JSON.stringify(e));
    return { redirect: { destination: '/login', permanent: false } };
  });
  try {
    const { id } = ctx.query;
    const snapshot = await ssr.doc(`/gifts/${id}`).get();
    const doc = snapshot.data() as Gift;
    if (snapshot.id !== id) throw 'gift id mismatch';
    if (!doc) return { notFound: true };

    const user = await ssr.doc(`/users/${doc.owner}`).get();
    const owner_name = user.get('name') || user.get('email');
    const gift: Gift = {
      ...doc,
      id: snapshot.id,
      owner_name,
    };
    return { props: { gift } };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  return { redirect: { destination: '/login', permanent: false } };
};
