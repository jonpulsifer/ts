import { getGift, getUser } from 'lib/firebase-ssr';
import { GiftCard } from 'components/Gift';
import { Suspense } from 'react';
import Loading from './loading';
import { Metadata } from 'next';

interface Props {
  params: { [K in string]: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gift } = await getGift(params.id);
  return {
    title: gift.name || 'Gift',
    description: gift.notes || 'A gift',
  };
}

const GiftPage = async ({ params }: Props) => {
  const { gift } = await getGift(params.id);
  const { user } = await getUser(gift.owner);

  return (
    <Suspense fallback={<Loading />}>
      <GiftCard gift={gift} user={user} />
    </Suspense>
  );
};

export default GiftPage;
