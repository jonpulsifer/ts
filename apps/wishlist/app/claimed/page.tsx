import GiftList from 'components/GiftList';
import { getClaimedGiftsForMe } from 'lib/prisma-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claimed Gifts',
  description: 'See what gifts you have claimed',
};

const ClaimedPage = async () => {
  const gifts = await getClaimedGiftsForMe();
  return <GiftList gifts={gifts} />;
};

export default ClaimedPage;
