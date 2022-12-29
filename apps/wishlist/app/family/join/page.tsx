import { getFamilies } from '../../../lib/firebase-ssr';
import { redirect } from 'next/navigation';
import FamilyList from '../../../components/FamilyList';
import { Suspense } from 'react';
import Loading from './loading';
import Frame from '../../../components/Frame';

const JoinFamilyPage = async () => {
  const { families, user } = await getFamilies();
  if (!user) redirect('/login');
  return (
    <Frame title="Join a Family">
      <Suspense fallback={<Loading />}>
        <FamilyList families={families} user={user} />;
      </Suspense>
    </Frame>
  );
};

export default JoinFamilyPage;
