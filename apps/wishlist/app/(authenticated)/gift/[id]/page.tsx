import { auth } from 'app/auth';
import { GiftCard } from 'components/Gift';
import { getGiftById, getUserWithGiftsById } from 'lib/prisma-ssr';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

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
  const session = await auth();
  const gift = await getGiftById(params.id);
  if (!gift || !session?.user) {
    notFound();
  }
  const user = await getUserWithGiftsById(gift.ownerId);
  return <GiftCard gift={gift} user={user} currentUserId={session.user.id} />;
};

export default GiftPage;
