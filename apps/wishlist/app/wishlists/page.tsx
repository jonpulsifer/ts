import FamilyList from 'components/FamilyList';
import Page from 'components/Page';
import { getWishlists } from 'lib/prisma-ssr';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join a wishlist',
  description: 'Join a wishlist',
};

const WishlistsPage = async () => {
  const { wishlists, user } = await getWishlists();
  return (
    <Page title="Wishlists">
      <FamilyList user={user} wishlists={wishlists} />
    </Page>
  );
};

export default WishlistsPage;
