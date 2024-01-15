import { faPeopleRoof } from '@fortawesome/free-solid-svg-icons';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { CardAction } from '@repo/ui/card';
import { Card } from '@repo/ui/card';
import EmptyState from '../../components/EmptyState';
import Page from '../../components/Page';
import { getPeopleForUser } from '../../lib/prisma-ssr';
import type { UserWithGifts } from '../../types/prisma';

export const metadata: Metadata = {
  title: 'People',
  description: 'See who is in your family.',
};

const PeoplePage = async () => {
  const { users, user } = await getPeopleForUser();

  const action: CardAction = {
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

  const userTable = (users: UserWithGifts[]) => {
    const rows = users.map((user) => {
      const { id, name, email, image } = user;
      return (
        <tr
          className="border-t hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-950 transition ease-in-out duration-300 select-none"
          key={id}
        >
          <td className="flex flex-row w-full">
            <div className="w-full">
              <Link className="flex" href={`/user/${id}`}>
                <div className="flex grow items-center space-x-4 p-2 px-4">
                  <div
                    className={`inline-flex overflow-hidden relative justify-center items-center w-10 h-10 rounded-full ${
                      image ? '' : 'bg-gray-200 dark:bg-slate-800'
                    }`}
                  >
                    {image ? (
                      <Image
                        alt="Profile Photo"
                        className="rounded-full"
                        fill
                        sizes="30px"
                        src={image}
                      />
                    ) : (
                      <span className="font-medium noselect text-gray-600 dark:text-indigo-500">
                        {(name || email)[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="font-semibold text-xl text-black dark:text-slate-200">
                      {name || email}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </td>
        </tr>
      );
    });

    return (
      <table className="table-auto w-full">
        <tbody>{rows}</tbody>
      </table>
    );
  };
  return (
    <Page>
      <Card
        action={action}
        subtitle="This is a list of everyone that can see your wishlist."
        title="Family Members"
      >
        {userTable(users)}
      </Card>
    </Page>
  );
};

export default PeoplePage;
