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
      <header className="flex flex-row items-center gap-2 p-2 bg-inherit text-black dark:text-slate-400 items-center text-semibold border-b border-transparent">
        <h1 className="grow tracking-tightflex-none font-bold text-2xl noselect drop-shadow-lg">
          {title}
        </h1>
        <DaysUntilChristmasBadge />
      </header>
      <div className="mx-auto max-w-3xl sm:px-6 lg:px-8 items-center pb-28">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

export default Page;
