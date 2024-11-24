import { isAuthenticated } from 'lib/prisma-ssr';
import type { Metadata } from 'next';
import Wishlists from './components/wishlists';
import { getWishlistsWithMemberIds } from 'lib/prisma-cached';
export const metadata: Metadata = {
  title: 'Join a wishlist',
  description: 'Join a wishlist',
};

const WishlistsPage = async () => {
  const { user: currentUser } = await isAuthenticated();
  const wishlists = await getWishlistsWithMemberIds();

  return <Wishlists userId={currentUser.id} wishlists={wishlists} />;
};

export default WishlistsPage;
