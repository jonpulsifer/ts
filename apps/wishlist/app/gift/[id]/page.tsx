import Frame from '../../../components/Frame';
import { getGift, getUser } from '../../../lib/firebase-ssr';
import { GiftCard } from '../../../components/Gift';
import { Suspense } from 'react';
import Loading from './loading';

interface Props {
  params: { [K in string]: string };
}

const GiftPage = async ({ params }: Props) => {
  const { gift } = await getGift(params.id);
  const { user } = await getUser(gift.owner);

  return (
    <Frame title={gift.name}>
      <Suspense fallback={<Loading />}>
        <GiftCard gift={gift} user={user} />
      </Suspense>
    </Frame>
  );
};

export default GiftPage;
