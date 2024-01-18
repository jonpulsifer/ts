import Link from 'next/link';
import type { FormEvent, MouseEvent } from 'react';
import React from 'react';

export interface CardAction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- cause i'm migrating
  icon?: any;
  title: string;
  danger?: boolean;
  secondary?: boolean;
  onClick?: ((e: MouseEvent | FormEvent) => void) | (() => void) | undefined;
  submit?: string;
  link?: string;
}

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badges?: React.ReactNode;
  children?: React.ReactNode;
  action?: CardAction | CardAction[];
}

export function Card({
  title,
  subtitle,
  action,
  badges,
  children,
}: CardProps): JSX.Element {
  const headerContent = (
    <div className="flex flex-row">
      <div className="flex flex-col grow xs:gap-2">
        <h1 className="text-xl font-semibold leading-6 text-gray-900 dark:text-slate-200">
          {title}
        </h1>
        <div>
          <p className="text-xs text-gray-500 dark:text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center">{badges}</div>
    </div>
  );

  const actions: CardAction[] = [];
  if (action && Array.isArray(action)) {
    actions.push(...action);
  } else if (action) {
    actions.push(action);
  }

  const actionsMarkup = actions.length
    ? actions.map((action) => {
        const actionIcon = action.icon ? (
          <div className="flex">{action.icon}</div>
        ) : null;
        const baseButtonClass =
          'font-semibold text-white inline-flex w-full justify-center items-center rounded-md bg-indigo-600 px-3 py-2 shadow-sm sm:ml-3 sm:w-auto mt-2 sm:mt-0';
        const secondaryButtonClass =
          'font-semibold text-gray-900 dark:text-slate-400 mt-3 inline-flex w-full justify-center items-center rounded-md bg-white dark:bg-slate-900 px-3 py-2 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 hover:bg-gray-50 sm:mt-0 sm:w-auto';
        const dangerClass = `bg-red-500 hover:bg-red-500 ${baseButtonClass}`;
        const infoClass = `bg-indigo-600 hover:bg-indigo-500 ${baseButtonClass}`;

        const buttonClass = action.danger ? dangerClass : infoClass;
        const buttonMarkup = action.secondary
          ? secondaryButtonClass
          : buttonClass;
        const button = (
          <button
            className={buttonMarkup}
            form={action.submit ? action.submit : undefined}
            key={action.title}
            onClick={action.onClick ? action.onClick : undefined}
            type={action.submit ? 'submit' : 'button'}
          >
            {actionIcon}
            {action.title}
          </button>
        );
        return action.link ? (
          <Link href={{ pathname: action.link }} key={action.title}>
            {button}
          </Link>
        ) : (
          button
        );
      })
    : null;

  const footer = <div className="px-4 py-4 sm:px-6">{actionsMarkup}</div>;
  const header = <div className="px-4 py-4 sm:px-6">{headerContent}</div>;

  const headerMarkup = title ? header : null;
  const footerMarkup = actions.length ? footer : null;
  return (
    <div className="divide-y dark:divide-slate-800 divide-gray-200 overflow-hidden xs:rounded-lg bg-white dark:bg-slate-900 dark:text-gray-400 shadow shadow-md border-transparent">
      {headerMarkup}
      <div className="px-4 py-4 sm:px-6">{children}</div>
      {footerMarkup}
    </div>
  );
}
