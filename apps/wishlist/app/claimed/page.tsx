import Frame from '../../components/Frame';
import GiftList from '../../components/GiftList';
import Loading from '../../components/Loading';
import { getClaimedGifts } from '../../lib/firebase-ssr';
import { Suspense } from 'react';

const ClaimedPage = async () => {
  const { gifts } = await getClaimedGifts();
  return (
    <Frame title="Claimed Gifts">
      <Suspense fallback={<Loading />}>
        <GiftList gifts={gifts} />
      </Suspense>
    </Frame>
  );
};

export default ClaimedPage;
