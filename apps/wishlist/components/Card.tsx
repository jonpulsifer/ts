import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React, { FormEvent, MouseEvent } from 'react';

export interface CardAction {
  icon?: IconDefinition;
  title: string;
  danger?: boolean;
  fn?: (e: MouseEvent | FormEvent) => void;
  link?: string;
}

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  action?: CardAction | CardAction[];
}

const Card = ({ title, subtitle, action, children }: CardProps) => {
  const titleMarkup = (
    <div className="px-4 pt-2 dark:text-gray-400 pb-4">
      <h1 className="text-base font-semibold leading-6 text-gray-900 dark:text-slate-200">
        {title}
      </h1>
      <div className="mt-2">
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
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
          'inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto mt-2 sm:mt-0';
        const dangerClass = `bg-red-500 ${baseButtonClass}`;
        const infoClass = `bg-indigo-600 ${baseButtonClass}`;
        const buttonClass = action.danger ? dangerClass : infoClass;
        const button = (
          <button
            className={buttonClass}
            onClick={
              action?.fn ? (e) => (action.fn ? e : undefined) : undefined
            }
            key={`fb-${idx}`}
          >
            {actionIcon}
            <div className="">{action?.title}</div>
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
    <div className="bg-gray-50 rounded-b-lg dark:bg-slate-900 px-4 py-3 sm:flex sm:flex-row-reverse">
      {actionsMarkup}
    </div>
  );

  const headerMarkup = title ? titleMarkup : null;
  const footerMarkup = actions.length ? footer : null;
  return (
    <div className="flex flex-col rounded-lg bg-white dark:bg-slate-900 sm:max-w-2xl dark:text-gray-400 shadow shadow-md border-transparent">
      <div className="my-2 text-center sm:text-left bg-white dark:bg-gray-900">
        {headerMarkup}
        {children}
      </div>
      {footerMarkup}
    </div>
  );
};

export default Card;
