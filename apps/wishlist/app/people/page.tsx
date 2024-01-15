import { faPeopleRoof } from '@fortawesome/free-solid-svg-icons';
import { Card } from '@repo/ui/card';
import type { Metadata } from 'next';

import EmptyState from '../../components/EmptyState';
import Page from '../../components/Page';
import { getPeopleForUser } from '../../lib/prisma-ssr';
import { UserTable } from './components/user-table';

export const metadata: Metadata = {
  title: 'People',
  description: 'See who is in your family.',
};

const PeoplePage = async () => {
  const { users, user } = await getPeopleForUser();

  const action = {
    title: 'View all wishlists',
    icon: faPeopleRoof,
    link: '/wishlists',
  };
  const people = users.length;
  const hasWishlists = user.wishlists.length;
  const noPeopleMarkup = hasWishlists ? (
    <p>
      You&apos;re the first one here!{' '}
      <span className="font-semibold">Share wishin.app with your family!</span>
    </p>
  ) : (
    <p>
      Please{' '}
      <span className="font-bold dark:text-slate-200">join a wishlist</span> or{' '}
      <span className="font-bold dark:text-slate-200">invite your family</span>
    </p>
  );

  if (!people) {
    return (
      <EmptyState
        action={action}
        subtitle="The elves could not find anyone but you!"
        title="👪 No People Found"
      >
        <div className="p-4">{noPeopleMarkup}</div>
      </EmptyState>
    );
  }

  return (
    <Page>
      <Card
        subtitle="This is a list of everyone that can see your wishlist."
        title="Family Members"
      >
        <UserTable users={users} />
      </Card>
    </Page>
  );
};

export default PeoplePage;
