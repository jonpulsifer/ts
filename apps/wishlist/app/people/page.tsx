import Frame from '../../components/Frame';
import UserList from '../../components/UserList';
import Link from 'next/link';
import { Suspense } from 'react';
import Loading from './loading';
import { getPeopleForUser } from '../../lib/firebase-ssr';
import { Card, CardAction } from 'ui';
import { faPeopleRoof } from '@fortawesome/free-solid-svg-icons';

const PeoplePage = async () => {
  const { users, user } = await getPeopleForUser();

  const action: CardAction = {
    title: 'View All Families',
    icon: faPeopleRoof,
  };

  const noPeople = !users || !users.length;
  const hasFamilies = user?.families && user.families.length;
  const noPeopleMarkup = hasFamilies ? (
    <>
      You&apos;re the first one here!{' '}
      <span className="font-semibold">Share wishin.app with your family!</span>
    </>
  ) : (
    <>
      The elves couldn&apos;t find anyone. Have you{' '}
      <Link className="text-blue-600 font-semibold" href="/family/join">
        joined a family?
      </Link>
    </>
  );

  return (
    <Frame title="People">
      <Suspense fallback={<Loading />}>
        {noPeople ? (
          <>
            <Card title="🧑 No People Found" action={action}>
              <div className="p-4">{noPeopleMarkup}</div>
            </Card>
          </>
        ) : (
          <UserList users={users} user={user} />
        )}
      </Suspense>
    </Frame>
  );
};

export default PeoplePage;
