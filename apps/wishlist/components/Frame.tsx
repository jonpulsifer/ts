'use client';
import React, { useState } from 'react';
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
import Modal from './GiftModal';
import { usePathname } from 'next/navigation';
interface Props {
  children: React.ReactNode;
}

const daysUntilChristmas = () => {
  const today = new Date();
  const christmas = new Date(today.getFullYear(), 11, 25);
  if (today.getMonth() === 11 && today.getDate() > 25) {
    christmas.setFullYear(christmas.getFullYear() + 1);
  }
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.ceil((christmas.getTime() - today.getTime()) / oneDay);
};

// generate title from path name
const generateTitle = (path: string | null) => {
  switch (path) {
    case '/family/join':
      return '👪 Join a Family';
    case '/gifts':
      return '🎁 Gifts';
    case '/people':
      return '👪 People';
    case '/claimed':
      return '🛒 Claimed Gifts';
    case '/user/me':
      return '👤 Profile';
    default:
      return '🎁 wishin.app';
  }
};

const Frame = ({ children }: Props) => {
  const [showGiftModal, setShowGiftModal] = useState(false);
  const path = usePathname();
  if (path === '/' || path === '/login') {
    return <>{children}</>;
  }
  const title = generateTitle(path);
  return (
    <div className="flex flex-col flex-grow">
      <div className="flex flex-row flex-grow">
        <Nav />
        <div className="flex flex-col flex-grow w-full h-full">
          <header className="flex w-full h-16 text-white dark:text-gray-400 items-center p-4 text-semibold border-b border-transparent space-x-2">
            <h1 className="flex font-bold text-2xl noselect drop-shadow-lg">
              {title}
            </h1>
            <div className="flex flex-1 truncate justify-end">
              <p className="text-xs text-right truncate">
                <span className="font-bold text-white dark:text-indigo-500">
                  {`📅 ${daysUntilChristmas()}`}
                </span>{' '}
                days until Christmas🎄
              </p>
            </div>
          </header>
          <div className="">
            <div className="flex flex-col max-w-screen items-center justify-center">
              <div className="p-4 space-y-5 sm:max-w-2xl w-full mb-24">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed block sm:hidden bottom-0 w-full h-16 bg-white border-t border-gray-200 dark:bg-slate-900 dark:border-gray-800">
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
                className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500"
                fill="currentColor"
                key={'Gifts'}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500">
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
                className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500"
                fill="currentColor"
                key={'People'}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500">
                People
              </span>
            </Link>
          </button>
          <button
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          >
            <Link
              href="#"
              className="flex flex-col items-center"
              prefetch={false}
              onClick={() => {
                setShowGiftModal(true);
                console.log('wat');
              }}
            >
              <FontAwesomeIcon
                icon={faPlusSquare}
                className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500"
                fill="currentColor"
                key={'NewGift'}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500">
                Add
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
                className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500"
                fill="currentColor"
                key={'Claimed'}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500">
                Claimed
              </span>
            </Link>
          </button>
          <button
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          >
            <Link
              href="/user/me"
              className="flex flex-col items-center"
              prefetch={false}
            >
              <FontAwesomeIcon
                icon={faPersonRays}
                className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500"
                fill="currentColor"
                key={'Profile'}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-500">
                Profile
              </span>
            </Link>
          </button>
        </div>
        <Modal isOpen={showGiftModal} setIsOpen={setShowGiftModal} />
      </div>
    </div>
  );
};

export default Frame;
