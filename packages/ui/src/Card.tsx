import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React, { FormEvent, MouseEvent } from 'react';

export interface CardAction {
  icon?: IconDefinition;
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

const Card = ({
  title,
  subtitle,
  action,
  badges,
  children,
}: CardProps): JSX.Element => {
  const titleMarkup = (
    <div className="flex flex-row gap-4 p-4 truncate">
      <div className="flex flex-col grow dark:text-gray-400">
        <h1 className="text-base font-semibold leading-6 text-gray-900 dark:text-slate-200">
          {title}
        </h1>
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-slate-400">
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
    ? actions.map((action, idx) => {
        const actionIcon = action.icon ? (
          <div className="flex">
            <FontAwesomeIcon icon={action.icon} className="pr-2" />
          </div>
        ) : null;
        const baseButtonClass =
          'font-semibold text-white inline-flex w-full justify-center items-center rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-2 shadow-sm sm:ml-3 sm:w-auto mt-2 sm:mt-0';
        const secondaryButtonClass =
          'font-semibold text-gray-900 dark:text-slate-400 mt-3 inline-flex w-full justify-center items-center rounded-md bg-white dark:bg-slate-900 px-3 py-2 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 hover:bg-gray-50 sm:mt-0 sm:w-auto';
        const dangerClass = `bg-red-500 ${baseButtonClass}`;
        const infoClass = `bg-indigo-600 ${baseButtonClass}`;

        const buttonClass = action.danger ? dangerClass : infoClass;
        const actionsMarkup = action.secondary
          ? secondaryButtonClass
          : buttonClass;
        const button = (
          <button
            className={actionsMarkup}
            onClick={action?.onClick ? action.onClick : undefined}
            key={`fb-${idx}`}
            type={action.submit ? 'submit' : 'button'}
            form={action.submit ? action.submit : undefined}
          >
            {actionIcon}
            {action?.title}
          </button>
        );
        return action.link ? (
          <Link href={action.link} key={`fb-${idx}`}>
            {button}
          </Link>
        ) : (
          button
        );
      })
    : null;

  const footer = (
    <div className="bg-gray-50 dark:bg-slate-900 rounded-b-lg px-4 py-3 sm:flex sm:flex-row-reverse">
      {actionsMarkup}
    </div>
  );

  const headerMarkup = title ? titleMarkup : null;
  const footerMarkup = actions.length ? footer : null;
  return (
    <div className="flex flex-col h-max rounded-lg bg-white dark:bg-slate-900 sm:max-w-2xl dark:text-gray-400 shadow shadow-md border-transparent">
      <div className="my-2 sm:text-left bg-white dark:bg-slate-900">
        {headerMarkup}
        {children}
      </div>
      {footerMarkup}
    </div>
  );
};

export default Card;
