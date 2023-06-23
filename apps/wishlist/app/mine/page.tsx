import GiftList from 'components/GiftList';
import Page from 'components/Page';
import { getAllUserGifts } from 'lib/firebase-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: "See what's on your wishlist",
};

const MyGiftsPage = async () => {
  const { gifts } = await getAllUserGifts();
  return (
    <Page title="🎁 My Gifts">
      <GiftList gifts={gifts} />
    </Page>
  );
};

export default MyGiftsPage;
