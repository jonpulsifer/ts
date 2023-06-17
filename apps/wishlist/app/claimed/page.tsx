import GiftList from 'components/GiftList';
import { getClaimedGifts } from 'lib/firebase-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claimed Gifts',
  description: 'See what gifts you have claimed',
};

const ClaimedPage = async () => {
  const { gifts } = await getClaimedGifts();
  return <GiftList gifts={gifts} />;
};

export default ClaimedPage;
