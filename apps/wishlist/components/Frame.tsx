'use client';
import React from 'react';
import { Sidebar, BottomNav } from './Nav';
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
  const path = usePathname();
  if (path === '/' || path === '/login') {
    return <>{children}</>;
  }
  const title = generateTitle(path);
  return (
    <div className="flex flex-col h-full">
      <header className="flex flex-row items-center w-full h-16 bg-inherit sm:bg-gray-50 sm:border-b sm:border-gray-300 sm:dark:bg-slate-900 sm:dark:border-slate-800 text-black dark:text-slate-400 items-center p-4 text-semibold border-b border-transparent gap-4">
        <h1 className="grow flex-none font-bold text-2xl noselect drop-shadow-lg">
          {title}
        </h1>
        <div className="shrink truncate flex-end">
          <p className="text-xs text-right truncate">
            <span className="font-bold text-indigo-600 dark:text-indigo-500">
              {`📅 ${daysUntilChristmas()}`}
            </span>{' '}
            days until Christmas🎄
          </p>
        </div>
      </header>
      <div className="flex flex-row h-full bg-[url('/santa.png')] bg-origin-border bg-no-repeat bg-right-top sm:bg-right-bottom">
        <Sidebar />
        <div className="flex flex-col w-full items-center p-2 sm:p-4 h-full">
          <div className="sm:max-w-2xl w-full flex flex-col space-y-4 h-full">
            {children}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Frame;
