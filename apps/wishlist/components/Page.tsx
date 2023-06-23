'use client';
import { usePathname } from 'next/navigation';
import React from 'react';

import { BottomNav, Sidebar } from './Nav';

interface Props {
  children: React.ReactNode;
  title?: string;
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

const DaysUntilChristmas = (count = daysUntilChristmas()) => {
  const baseFontColor =
    'text-indigo-700 dark:text-indigo-500 bg-indigo-50 dark:bg-slate-950/25 ring-indigo-700/10 dark:ring-indigo-500/10';
  const fontColor =
    count >= 0 && count < 30
      ? 'text-red-700 dark:text-red-500 bg-red-50 dark:bg-red-950/25 ring-red-700/10 dark:ring-red-500/10'
      : count > 30 && count < 90
      ? 'text-yellow-700 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950/25 ring-yellow-700/10 dark:ring-yellow-500/10'
      : count > 90 && count < 180
      ? 'text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-950/25 ring-green-700/10 dark:ring-green-500/10'
      : baseFontColor;
  const baseClass = `text-center inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${fontColor}`;
  return (
    <span className={baseClass}>
      🎅 {count} day{count > 1 || count === 0 ? 's' : ''} to Christmas
    </span>
  );
};

const Page = ({ title, children }: Props) => {
  const path = usePathname();
  if (path === '/' || path === '/login') {
    return <>{children}</>;
  }
  const pageTitle = title || generateTitle(path);
  return (
    <div className="flex flex-col h-full">
      <header className="flex flex-row fixed items-center w-full h-16 bg-inherit sm:bg-gray-50 sm:border-b sm:border-gray-300 sm:dark:bg-slate-900 sm:dark:border-slate-800 text-black dark:text-slate-400 gap-2 sm:gap-4 items-center p-2 sm:p-4 text-semibold border-b border-transparent">
        <h1 className="grow flex-none font-bold text-2xl noselect drop-shadow-lg">
          {pageTitle}
        </h1>
        <div className="flex-end">{DaysUntilChristmas()}</div>
      </header>
      <div className="flex flex-row h-full mt-0 sm:mt-16">
        <Sidebar />
        <div className="flex flex-col w-full items-center p-2 sm:p-4 h-full">
          <div className="sm:max-w-2xl w-full flex flex-col space-y-4 h-full">
            <div className="space-y-4 pb-28 sm:pb-0 grow">{children}</div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Page;
