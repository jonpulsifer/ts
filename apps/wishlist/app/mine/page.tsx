import GiftList from 'components/GiftList';
import Page from 'components/Page';
import { getMeWithGifts } from 'lib/prisma-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: "See what's on your wishlist",
};

const MyGiftsPage = async () => {
  const user = await getMeWithGifts();
  return (
    <Page>
      <GiftList gifts={user.gifts} currentUserId={user.id} />
    </Page>
  );
};

export default MyGiftsPage;
