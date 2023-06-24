import FamilyList from 'components/FamilyList';
import { getFamilies } from 'lib/firebase-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join a wishlist',
  description: 'Join a wishlist',
};

const JoinFamilyPage = async () => {
  const { families, user } = await getFamilies();
  return <FamilyList families={families} user={user} />;
};

export default JoinFamilyPage;
