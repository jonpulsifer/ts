'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function AppShellSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    </div>
  );
}
