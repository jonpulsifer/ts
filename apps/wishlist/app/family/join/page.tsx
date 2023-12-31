import FamilyList from 'components/FamilyList';
import Page from 'components/Page';
import { getWishlists } from 'lib/prisma-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join a wishlist',
  description: 'Join a wishlist',
};

const JoinFamilyPage = async () => {
  const { wishlists, user } = await getWishlists();
  return (
    <Page>
      <FamilyList wishlists={wishlists} user={user} />
    </Page>
  );
};

export default JoinFamilyPage;
