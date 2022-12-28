'use client';

import { faPeopleRoof } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AppUser } from '../types';

import Card, { CardAction } from './Card';

interface Props {
  user: AppUser;
  users: AppUser[];
}

const UserList = ({ users, user }: Props) => {
  const router = useRouter();
  const action: CardAction = {
    title: 'Join a Family',
    icon: faPeopleRoof,
    fn: () => router.push('/family/join'),
  };

  if (!users || !users.length) {
    const content =
      user?.families && user.families.length ? (
        <>
          You&apos;re the first one here!{' '}
          <span className="font-semibold">
            Share wishin.app with your family!
          </span>
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
      <Card title="🧑 No People Found" action={action}>
        <div className="p-4">{content}</div>
      </Card>
    );
  }
  const userList = (appUsers: AppUser[]) => {
    return appUsers.map((appUser, idx, { length }) => {
      const { uid, name, email, photoUrl } = appUser;
      const isLast = length - 1 === idx;
      return (
        <tr
          key={uid}
          className="border-t hover:bg-gray-50 transition ease-in-out duration-300 select-none"
        >
          <td className={`w-full py-2 ${isLast ? 'rounded-bl-lg' : ''}`}>
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
                <div className="font-semibold text-xl">{name || email}</div>
                {/* <div className="text-xs text-gray-400">{email}</div> */}
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
      subtitle="This is a list of everyone in your families"
      action={action}
    >
      <div className="pb-4" />
      <table className="table-auto w-full rounded-lg">
        <thead className="">
          <tr className=""></tr>
        </thead>
        <tbody className="rounded rounded-xl">{userList(users)}</tbody>
      </table>
    </Card>
  );
};

export default UserList;
