import { getWishlists } from 'lib/prisma-ssr';
import type { Metadata } from 'next';
import Wishlists from './components/wishlists';

export const metadata: Metadata = {
  title: 'Join a wishlist',
  description: 'Join a wishlist',
};

const WishlistsPage = async () => {
  const { wishlists, user } = await getWishlists();
  return <Wishlists user={user} wishlists={wishlists} />;
};

export default WishlistsPage;
