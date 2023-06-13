'use client';

import { faPeopleRoof } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import type { AppUser } from '../types';
import Card, { CardAction } from './Card';

interface Props {
  user: AppUser;
  users: AppUser[];
}

const UserList = ({ users }: Props) => {
  const action: CardAction = {
    title: 'View All Families',
    icon: faPeopleRoof,
    link: '/family/join',
  };
  const userList = (appUsers: AppUser[]) => {
    return appUsers.map((appUser) => {
      const { uid, name, email, photoUrl } = appUser;
      return (
        <tr
          key={uid}
          className="border-t hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-950 transition ease-in-out duration-300 select-none"
        >
          <td className="w-full py-2">
            <Link href={`/user/${uid}`}>
              <div className="flex items-center space-x-4 p-2 px-4">
                <div
                  className={`inline-flex overflow-hidden relative justify-center items-center w-10 h-10 rounded-full ${
                    photoUrl ? '' : 'bg-gray-200'
                  }`}
                >
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt="Profile Photo"
                      className="rounded-full"
                      fill
                    />
                  ) : (
                    <span className="font-medium noselect text-gray-600">
                      {(name || email)[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <div className="font-semibold text-xl">{name || email}</div>
                </div>
              </div>
            </Link>
          </td>
        </tr>
      );
    });
  };

  return (
    <Card
      title="Family Members"
      subtitle="This is a list of everyone that can see your wishlist."
      action={action}
    >
      <table className="table-auto w-full rounded-lg">
        <tbody>{userList(users)}</tbody>
      </table>
    </Card>
  );
};

export default UserList;
