import GiftList from 'components/GiftList';
import Loading from './loading';
import { getGifts } from 'lib/firebase-ssr';
import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gifts',
  description: "See everyone's gifts",
};

const GiftsPage = async () => {
  const { gifts } = await getGifts();

  return (
    <Suspense fallback={<Loading />}>
      <GiftList gifts={gifts} />
    </Suspense>
  );
};

export default GiftsPage;
