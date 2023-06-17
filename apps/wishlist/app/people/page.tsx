import UserList from 'components/UserList';
import Link from 'next/link';
import { Suspense } from 'react';
import Loading from './loading';
import { getPeopleForUser } from 'lib/firebase-ssr';
import Card, { CardAction } from 'components/Card';
import { faPeopleRoof } from '@fortawesome/free-solid-svg-icons';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'People',
  description: 'See who is in your family.',
};

const PeoplePage = async () => {
  const { users, user } = await getPeopleForUser();

  const action: CardAction = {
    title: 'View all wishlists',
    icon: faPeopleRoof,
    link: '/family/join',
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
      <Link className="text-indigo-600 font-semibold" href="/family/join">
        joined a wishlist?
      </Link>
    </>
  );

  return (
    <Suspense fallback={<Loading />}>
      {noPeople ? (
        <Card title="👪 No People Found" action={action}>
          <div className="p-4">{noPeopleMarkup}</div>
        </Card>
      ) : (
        <UserList users={users} user={user} />
      )}
    </Suspense>
  );
};

export default PeoplePage;
