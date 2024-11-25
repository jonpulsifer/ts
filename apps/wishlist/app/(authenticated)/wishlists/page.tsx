import { getWishlistsWithMemberIds } from 'lib/prisma-cached';
import type { Metadata } from 'next';
import Wishlists from './components/wishlists';
export const metadata: Metadata = {
  title: 'Join a wishlist',
  description: 'Join a wishlist',
};

const WishlistsPage = async () => {
  const wishlists = await getWishlistsWithMemberIds();

  return <Wishlists wishlists={wishlists} />;
};

export default WishlistsPage;
