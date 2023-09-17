import GiftList from 'components/GiftList';
import { getMeWithGifts } from 'lib/prisma-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: "See what's on your wishlist",
};

const MyGiftsPage = async () => {
  const user = await getMeWithGifts();
  return <GiftList gifts={user.gifts} />;
};

export default MyGiftsPage;
