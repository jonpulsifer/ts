import GiftList from 'components/GiftList';
import { getGifts } from 'lib/firebase-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gifts',
  description: "See everyone's gifts",
};

const GiftsPage = async () => {
  const { gifts } = await getGifts();
  return <GiftList gifts={gifts} />;
};

export default GiftsPage;
