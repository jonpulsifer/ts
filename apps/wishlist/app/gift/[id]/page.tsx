import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGiftById, getUserWithGiftsById } from '../../../lib/prisma-ssr';
import Page from '../../../components/Page';
import { GiftCard } from '../../../components/Gift';

interface PageProps {
  params: { [K in string]: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const gift = await getGiftById(params.id);
  return {
    title: gift?.name || 'Gift',
    description: gift?.description || 'A gift',
  };
}

const GiftPage = async ({ params }: PageProps) => {
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
