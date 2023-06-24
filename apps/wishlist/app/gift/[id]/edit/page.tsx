import Card from 'components/Card';
import EmptyState from 'components/EmptyState';
import GiftForm from 'components/GiftForm';
import { getGift } from 'lib/firebase-ssr';
import { Metadata } from 'next';
interface Props {
  params: { [K in string]: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gift } = await getGift(params.id);
  return {
    title: `Edit ${gift.name || '🎁 Edit Gift'}`,
    description: 'Edit a gift',
  };
}

const EditGiftPage = async ({ params }: Props) => {
  const { gift } = await getGift(params.id);
  return (
    <>
      {gift ? (
        <Card>
          <GiftForm gift={gift} />
        </Card>
      ) : (
        EmptyState({ title: 'Gift not found' })
      )}
    </>
  );
};

export default EditGiftPage;
