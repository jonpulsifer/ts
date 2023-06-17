import Card from 'components/Card';
import GiftForm from 'components/GiftForm';
import { getGift } from 'lib/firebase-ssr';
import { Metadata } from 'next';
interface Props {
  params: { [K in string]: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gift } = await getGift(params.id);
  return {
    title: `Edit ${gift.name || 'Gift'}`,
    description: 'Edit a gift',
  };
}

const EditGiftPage = async ({ params }: Props) => {
  const { gift } = await getGift(params.id);
  if (!gift) return <Card title="Gift Not Found" />;
  return (
    <Card>
      <GiftForm gift={gift} />
    </Card>
  );
};

export default EditGiftPage;
