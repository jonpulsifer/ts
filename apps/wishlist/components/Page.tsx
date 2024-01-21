'use client';
import { Badge } from '@repo/ui';

import { BottomNav } from './Nav';
import { Suspense } from 'react';
import Spinner from './Spinner';

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

function Page({ children, title }: Props) {
  return (
    <div className="h-full">
      <div className="mx-auto h-full max-w-3xl sm:px-6 lg:px-8 items-center mb-28">
        <header className="flex flex-row items-center gap-2 p-2 bg-inherit items-center text-semibold border-b border-transparent">
          <h1 className="grow tracking-tight flex-none font-bold text-2xl noselect drop-shadow-lg">
            {title || 'wishin.app'}
          </h1>
          <DaysUntilChristmasBadge />
        </header>
        <Suspense fallback={<Spinner />}>{children}</Suspense>
      </div>
      <BottomNav />
    </div>
  );
}

export default Page;
