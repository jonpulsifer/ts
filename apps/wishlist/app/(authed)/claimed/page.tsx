import GiftList from 'components/GiftList';
import Loading from './loading';
import { getClaimedGifts } from 'lib/firebase-ssr';
import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claimed Gifts',
  description: 'See what gifts you have claimed',
};

const ClaimedPage = async () => {
  const { gifts } = await getClaimedGifts();
  return (
    <Suspense fallback={<Loading />}>
      <GiftList gifts={gifts} />
    </Suspense>
  );
};

export default ClaimedPage;
