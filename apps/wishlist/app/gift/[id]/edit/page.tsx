import { Suspense } from 'react';
import Card from '../../../../components/Card';
import Frame from '../../../../components/Frame';
import GiftForm from '../../../../components/GiftForm';
import Loading from '../../../../components/Loading';
import { getGift } from '../../../../lib/firebase-ssr';

interface Props {
  params: { [K in string]: string };
}

const EditGiftPage = async ({ params }: Props) => {
  const { gift } = await getGift(params.id);
  if (!gift) return <Card title="Gift Not Found" />;
  return (
    <Frame title={gift.name}>
      <Suspense fallback={<Loading />}>
        <Card>
          <GiftForm gift={gift} />
        </Card>
      </Suspense>
    </Frame>
  );
};

export default EditGiftPage;
