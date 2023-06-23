import FamilyList from 'components/FamilyList';
import Page from 'components/Page';
import { getFamilies } from 'lib/firebase-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join a wishlist',
  description: 'Join a wishlist',
};

const JoinFamilyPage = async () => {
  const { families, user } = await getFamilies();
  return (
    <Page>
      <FamilyList families={families} user={user} />
    </Page>
  );
};

export default JoinFamilyPage;
