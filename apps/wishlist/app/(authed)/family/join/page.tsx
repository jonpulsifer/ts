import { getFamilies } from 'lib/firebase-ssr';
import FamilyList from 'components/FamilyList';
import { Suspense } from 'react';
import Loading from './loading';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join a Family',
  description: 'Join a wishlist',
};

const JoinFamilyPage = async () => {
  const { families, user } = await getFamilies();
  return (
    <Suspense fallback={<Loading />}>
      <FamilyList families={families} user={user} />
    </Suspense>
  );
};

export default JoinFamilyPage;
