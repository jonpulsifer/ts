import type { Metadata } from 'next';
import FamilyList from 'components/FamilyList';
import Page from 'components/Page';
import { getWishlists } from 'lib/prisma-ssr';

export const metadata: Metadata = {
  title: 'Join a wishlist',
  description: 'Join a wishlist',
};

const WishlistsPage = async () => {
  const { wishlists, user } = await getWishlists();
  return (
    <Page>
      <FamilyList user={user} wishlists={wishlists} />
    </Page>
  );
};

export default WishlistsPage;
