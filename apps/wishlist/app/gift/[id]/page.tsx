import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GiftCard } from 'components/Gift';
import Page from 'components/Page';
import { getGiftById, getUserWithGiftsById } from 'lib/prisma-ssr';

interface Props {
  params: { [K in string]: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const gift = await getGiftById(params.id);
  return {
    title: gift?.name || 'Gift',
    description: gift?.description || 'A gift',
  };
}

const GiftPage = async ({ params }: Props) => {
  const gift = await getGiftById(params.id);
  if (!gift) {
    notFound();
  }
  const user = await getUserWithGiftsById(gift.ownerId);
  return (
    <Page>
      <GiftCard gift={gift} user={user} />
    </Page>
  );
};

export default GiftPage;
