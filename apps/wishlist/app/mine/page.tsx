import Frame from '../../components/Frame';
import GiftList from '../../components/GiftList';
import Loading from './loading';
import { Suspense } from 'react';
import { getAllUserGifts } from '../../lib/firebase-ssr';

const MyGiftsPage = async () => {
  const { gifts } = await getAllUserGifts();
  return (
    <Frame title="My Wishlist">
      <Suspense fallback={<Loading />}>
        <GiftList gifts={gifts} />
      </Suspense>
    </Frame>
  );
};

export default MyGiftsPage;
