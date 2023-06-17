import GiftList from 'components/GiftList';
import Loading from './loading';
import { Suspense } from 'react';
import { getAllUserGifts } from 'lib/firebase-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: "See what's on your wishlist",
};

const MyGiftsPage = async () => {
  const { gifts } = await getAllUserGifts();
  return (
    <Suspense fallback={<Loading />}>
      <GiftList gifts={gifts} />
    </Suspense>
  );
};

export default MyGiftsPage;
