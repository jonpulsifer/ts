import { faPeopleRoof } from '@fortawesome/free-solid-svg-icons';
import { CardAction } from 'ui';
import EmptyState from 'components/EmptyState';
import UserList from 'components/UserList';
import { getPeopleForUser } from 'lib/firebase-ssr';
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
  const people = users && users.length;
  const hasFamilies = user?.families && user.families.length;
  const noPeopleMarkup = hasFamilies ? (
    <>
      You&apos;re the first one here!{' '}
      <span className="font-semibold">Share wishin.app with your family!</span>
    </>
  ) : (
    <>
      <p>
        Please{' '}
        <span className="font-bold dark:text-slate-200">join a wishlist</span>{' '}
        or{' '}
        <span className="font-bold dark:text-slate-200">
          invite your family
        </span>
      </p>
    </>
  );

  return (
    <>
      {people ? (
        <UserList users={users} user={user} />
      ) : (
        <EmptyState
          title="👪 No People Found"
          subtitle="The elves could not find anyone but you!"
          action={action}
        >
          <div className="p-4">{noPeopleMarkup}</div>
        </EmptyState>
      )}
    </>
  );
};

export default PeoplePage;
