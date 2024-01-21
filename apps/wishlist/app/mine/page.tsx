import GiftList from 'components/GiftList';
import Page from 'components/Page';
import { getMeWithGifts } from 'lib/prisma-ssr';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: "See what's on your wishlist",
};

const MyGiftsPage = async () => {
  const user = await getMeWithGifts();
  return (
    <Page title="My Gifts">
      <GiftList currentUserId={user.id} gifts={user.gifts} />
    </Page>
  );
};

export default MyGiftsPage;
