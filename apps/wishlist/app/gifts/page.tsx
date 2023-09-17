import GiftList from 'components/GiftList';
import { getVisibleGiftsForUser } from 'lib/prisma-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gifts',
  description: "See everyone's gifts",
};

const GiftsPage = async () => {
  const { gifts } = await getVisibleGiftsForUser();
  return <GiftList gifts={gifts} />;
};

export default GiftsPage;
