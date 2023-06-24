import GiftList from 'components/GiftList';
import { getAllUserGifts } from 'lib/firebase-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: "See what's on your wishlist",
};

const MyGiftsPage = async () => {
  const { gifts } = await getAllUserGifts();
  return <GiftList gifts={gifts} />;
};

export default MyGiftsPage;
