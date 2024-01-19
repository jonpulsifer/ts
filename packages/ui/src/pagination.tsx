import clsx from 'clsx';
import React from 'react';
import { Button } from './button';

export function Pagination({
  'aria-label': ariaLabel = 'Page navigation',
  className,
  ...props
}: React.ComponentPropsWithoutRef<'nav'>) {
  return (
    <nav
      aria-label={ariaLabel}
      {...props}
      className={clsx(className, 'flex gap-x-2')}
    />
  );
}

export function PaginationPrevious({
  href = null,
  children = 'Previous',
}: {
  href?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <span className="grow basis-0">
      <Button
        {...(href === null ? { disabled: true } : { href })}
        aria-label="Previous page"
        plain
      >
        <svg
          aria-hidden="true"
          className="stroke-current"
          data-slot="icon"
          fill="none"
          viewBox="0 0 16 16"
        >
          <path
            d="M2.75 8H13.25M2.75 8L5.25 5.5M2.75 8L5.25 10.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
        </svg>
        {children}
      </Button>
    </span>
  );
}

export function PaginationNext({
  href = null,
  children = 'Next',
}: {
  href?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <span className="flex grow basis-0 justify-end">
      <Button
        {...(href === null ? { disabled: true } : { href })}
        aria-label="Next page"
        plain
      >
        {children}
        <svg
          aria-hidden="true"
          className="stroke-current"
          data-slot="icon"
          fill="none"
          viewBox="0 0 16 16"
        >
          <path
            d="M13.25 8L2.75 8M13.25 8L10.75 10.5M13.25 8L10.75 5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
        </svg>
      </Button>
    </span>
  );
}

export function PaginationList({ children }: { children: React.ReactNode }) {
  return (
    <span className="hidden items-baseline gap-x-2 sm:flex">{children}</span>
  );
}

export function PaginationPage({
  href,
  children,
  current = false,
}: {
  href: string;
  children: string;
  current?: boolean;
}) {
  return (
    <Button
      aria-current={current ? 'page' : undefined}
      aria-label={`Page ${children}`}
      className={clsx(
        'min-w-[2.25rem] before:absolute before:-inset-px before:rounded-lg',
        current && 'before:bg-slate-950/5 dark:before:bg-white/10',
      )}
      href={href}
      plain
    >
      <span className="-mx-0.5">{children}</span>
    </Button>
  );
}

export function PaginationGap() {
  return (
    <div
      aria-hidden="true"
      className="w-[2.25rem] select-none text-center text-sm/6 font-semibold text-slate-950 dark:text-white"
    >
      &hellip;
    </div>
  );
}
