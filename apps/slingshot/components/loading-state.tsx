'use client';

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({
  label = 'Loading...',
  className = '',
}: LoadingStateProps) {
  return (
    <div
      className={`flex items-center justify-center py-12 text-sm text-muted-foreground ${className}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="absolute inset-0 h-8 w-8 animate-spin text-primary/20">
            <Loader2 className="h-8 w-8" />
          </div>
        </div>
        <p>{label}</p>
      </div>
    </div>
  );
}
