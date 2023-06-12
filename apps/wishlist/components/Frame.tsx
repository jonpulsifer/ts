'use client';
import React from 'react';
import Nav from './Nav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import {
  faGifts,
  faListCheck,
  faPeopleGroup,
  faPersonRays,
  faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './AuthProvider';
interface Props {
  children: React.ReactNode;
  title: string;
}

const Frame = ({ children, title }: Props) => {
  const { user } = useAuth();

  return (
    <div>
      <Nav title={title} />
      <div className="flex flex-col max-w-screen items-center justify-center">
        <div className="p-4 space-y-5 sm:max-w-2xl w-full">
          {children}
          <div className="fixed visible sm:invisible bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-slate-900 dark:border-gray-800">
            <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
              <button
                type="button"
                className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
              >
                <Link
                  href="/gifts"
                  className="flex flex-col items-center"
                  prefetch={false}
                >
                  <FontAwesomeIcon
                    icon={faGifts}
                    className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                    fill="currentColor"
                    key={'Gifts'}
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
                    Gifts
                  </span>
                </Link>
              </button>
              <button
                type="button"
                className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
              >
                <Link
                  href="/people"
                  className="flex flex-col items-center"
                  prefetch={false}
                >
                  <FontAwesomeIcon
                    icon={faPeopleGroup}
                    className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                    fill="currentColor"
                    key={'People'}
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
                    People
                  </span>
                </Link>
              </button>
              <button
                type="button"
                className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
              >
                <Link
                  href="/gift/new"
                  className="flex flex-col items-center"
                  prefetch={false}
                >
                  <FontAwesomeIcon
                    icon={faPlusSquare}
                    className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                    fill="currentColor"
                    key={'Gifts'}
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
                    Add Gift
                  </span>
                </Link>
              </button>
              <button
                type="button"
                className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
              >
                <Link
                  href="/claimed"
                  className="flex flex-col items-center"
                  prefetch={false}
                >
                  <FontAwesomeIcon
                    icon={faListCheck}
                    className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                    fill="currentColor"
                    key={'Claimed'}
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
                    Claimed
                  </span>
                </Link>
              </button>
              <button
                type="button"
                className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
              >
                <Link
                  href={`/user/${user?.uid}/edit`}
                  className="flex flex-col items-center"
                  prefetch={false}
                >
                  <FontAwesomeIcon
                    icon={faPersonRays}
                    className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                    fill="currentColor"
                    key={'Profile'}
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
                    Profile
                  </span>
                </Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Frame;
