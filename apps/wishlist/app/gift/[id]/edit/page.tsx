import Card from 'components/Card';
import EmptyState from 'components/EmptyState';
import GiftForm from 'components/GiftForm';
import Page from 'components/Page';
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
  if (!gift) return EmptyState({ title: 'Gift not found' });
  return (
    <Page>
      <Card>
        <GiftForm gift={gift} />
      </Card>
    </Page>
  );
};

export default EditGiftPage;
