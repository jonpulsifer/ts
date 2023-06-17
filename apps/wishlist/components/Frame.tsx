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
    <div className="flex flex-col flex-grow">
      <div className="flex flex-row flex-grow">
        <Sidebar />
        <div className="flex flex-col flex-grow w-full h-screen">
          <header className="flex w-full h-16 text-white dark:text-slate-400 items-center p-4 text-semibold border-b border-transparent space-x-2">
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
          <div className="flex flex-col max-w-screen items-center justify-center h-full">
            <div className="p-4 space-y-5 sm:max-w-2xl w-full h-full mb-24">
              {children}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Frame;
