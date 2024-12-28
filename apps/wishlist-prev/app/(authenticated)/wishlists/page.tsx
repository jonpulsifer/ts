import { getSession } from 'app/auth';
import { getWishlistsWithMemberIds } from 'lib/db/queries-cached';
import type { Metadata } from 'next';
import Wishlists from './components/wishlists';
export const metadata: Metadata = {
  title: 'Join a wishlist',
  description: 'Join a wishlist',
};

const WishlistsPage = async () => {
  const wishlists = await getWishlistsWithMemberIds();
  const { user } = await getSession();

  return <Wishlists currentUserId={user.id} wishlists={wishlists} />;
};

export default WishlistsPage;
