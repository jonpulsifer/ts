'use client';
import { Badge } from '@repo/ui/badge';
import { usePathname } from 'next/navigation';

import { BottomNav } from './Nav';

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
    case '/wishlists':
      return '👪 Join a Wishlist';
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

const DaysUntilChristmasBadge = () => {
  const count = daysUntilChristmas();
  const color =
    count >= 0 && count < 30
      ? 'red'
      : count > 30 && count < 90
        ? 'yellow'
        : count > 90 && count < 180
          ? 'green'
          : 'indigo';
  return (
    <Badge color={color}>
      🎅 {count} day{count > 1 || count === 0 ? 's' : ''} to Christmas
    </Badge>
  );
};

function Page({ children }: Props) {
  const title = generateTitle(usePathname());
  return (
    <div>
      <header className="flex flex-row items-center gap-2 p-2 bg-inherit dark:sm:bg-slate-950 dark:sm:border-slate-800 dark:border-slate-800 text-black dark:text-slate-400 items-center text-semibold border-b border-transparent">
        <h1 className="grow tracking-tightflex-none font-bold text-2xl noselect drop-shadow-lg">
          {title}
        </h1>
        <DaysUntilChristmasBadge />
      </header>
      <div className="flex flex-row h-full">
        <div className="flex flex-col w-full items-center h-full">
          <div className="sm:max-w-2xl w-full flex flex-col space-y-4 h-full">
            <div className="space-y-4 pb-28 sm:pb-0 grow">{children}</div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

export default Page;
