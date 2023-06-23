import { GiftCard } from 'components/Gift';
import Page from 'components/Page';
import { getGift, getUser } from 'lib/firebase-ssr';
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
    <Page title={gift.name}>
      <GiftCard gift={gift} user={user} />
    </Page>
  );
};

export default GiftPage;
