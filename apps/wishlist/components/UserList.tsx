'use client';

import type { User } from '@prisma/client';
import type { CardAction } from '@repo/ui/card';
import { Card } from '@repo/ui/card';
import { BookMarked } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { UserWithGifts } from 'types/prisma';

export interface UserListProps {
  users: UserWithGifts[];
  user: User;
}

function UserList({ users }: UserListProps) {
  const action: CardAction = {
    title: 'View All Wishlists',
    icon: BookMarked,
    link: '/wishlists',
  };
  const userList = (appUsers: UserWithGifts[]) => {
    function GiftCountBadge(count = 0) {
      const baseFontColor =
        'text-indigo-700 dark:text-indigo-500 bg-indigo-50 dark:bg-slate-950/25 ring-indigo-700/10 dark:ring-indigo-500/10';
      const fontColor =
        count >= 0 && count < 3
          ? 'text-red-700 dark:text-red-500 bg-red-50 dark:bg-red-950/25 ring-red-700/10 dark:ring-red-500/10'
          : count > 2 && count < 5
            ? 'text-yellow-700 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950/25 ring-yellow-700/10 dark:ring-yellow-500/10'
            : count > 4
              ? 'text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-950/25 ring-green-700/10 dark:ring-green-500/10'
              : baseFontColor;
      const baseClass = `flex-none w-16 justify-center inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${fontColor}`;

      return (
        <div className={baseClass}>
          {count} gift{count > 1 || count === 0 ? 's' : ''}
        </div>
      );
    }
    return appUsers.map((appUser) => {
      const { id, name, email, image } = appUser;
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
                <div className="flex items-center pr-4 text-center">
                  {GiftCountBadge(appUser.gifts.length)}
                </div>
              </Link>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <Card
      action={action}
      subtitle="This is a list of everyone that can see your wishlist."
      title="Family Members"
    >
      <table className="table-auto w-full">
        <tbody>{userList(users)}</tbody>
      </table>
    </Card>
  );
}

export default UserList;
