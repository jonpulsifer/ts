import Frame from '../../components/Frame';
import UserList from '../../components/UserList';
import { Suspense } from 'react';
import Loading from '../../components/Loading';
import { redirect } from 'next/navigation';
import { getPeopleForUser } from '../../lib/firebase-ssr';

const PeoplePage = async () => {
  const { users, user } = await getPeopleForUser();
  if (!users || !user) redirect('/login');

  return (
    <Frame title="People">
      <Suspense fallback={<Loading />}>
        <UserList users={users} user={user} />
      </Suspense>
    </Frame>
  );
};

export default PeoplePage;
