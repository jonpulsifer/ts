import Frame from '../../components/Frame';
import GiftList from '../../components/GiftList';
import Loading from './loading';
import { getGifts } from '../../lib/firebase-ssr';
import { Suspense } from 'react';

const GiftsPage = async () => {
  const { gifts } = await getGifts();

  return (
    <Frame title="Gift List">
      <Suspense fallback={<Loading />}>
        <GiftList gifts={gifts} />
      </Suspense>
    </Frame>
  );
};

export default GiftsPage;
