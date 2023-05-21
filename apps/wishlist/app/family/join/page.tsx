import { getFamilies } from '../../../lib/firebase-ssr';
import FamilyList from '../../../components/FamilyList';
import { Suspense } from 'react';
import Loading from './loading';
import Frame from '../../../components/Frame';

const JoinFamilyPage = async () => {
  const { families, user } = await getFamilies();
  return (
    <Frame title="Join a Family">
      <Suspense fallback={<Loading />}>
        <FamilyList families={families} user={user} />
      </Suspense>
    </Frame>
  );
};

export default JoinFamilyPage;
