import { Card } from '@repo/ui/card';
import { Strong, Text } from '@repo/ui/text';
import { BookMarked } from 'lucide-react';
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
    icon: BookMarked,
    link: '/wishlists',
  };
  const people = users.length;
  const hasWishlists = user.wishlists.length;
  const noPeopleMarkup = hasWishlists ? (
    <Text>
      You&apos;re the first one here!{' '}
      <Strong>Share wishin.app with your family!</Strong>
    </Text>
  ) : (
    <Text>
      Please <Strong className="dark:text-slate-200">join a wishlist</Strong> or{' '}
      <Strong className="dark:text-slate-200">invite your family</Strong>
    </Text>
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
        title="People in your wishlists"
        subtitle="This is a list of everyone that can see your wishlist"
      >
        <UserTable users={users} />
      </Card>
    </Page>
  );
};

export default PeoplePage;
