import EmptyState from 'components/EmptyState';
import GiftForm from 'components/GiftForm';
import { getGiftById } from 'lib/prisma-ssr';
import { Metadata } from 'next';
import { Card } from 'ui';
interface Props {
  params: { [K in string]: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const gift = await getGiftById(params.id);
  return {
    title: `Edit ${gift?.name || '🎁 Edit Gift'}`,
    description: 'Edit a gift',
  };
}

const EditGiftPage = async ({ params }: Props) => {
  const gift = await getGiftById(params.id);
  if (!gift) {
    return EmptyState({ title: 'Gift not found' });
  }
  return (
    <Card>
      <GiftForm gift={gift} />
    </Card>
  );
};

export default EditGiftPage;
