import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FormEvent, MouseEvent } from 'react';

export interface CardAction {
  icon?: IconDefinition;
  title: string;
  danger?: boolean;
  fn: (e: MouseEvent | FormEvent) => void;
}

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  action?: CardAction | CardAction[];
}

const Card = ({ title, subtitle, action, children }: CardProps) => {
  const titleMarkup = (
    <div className="px-4 pt-2 dark:text-gray-400">
      <h1 className="font-semibold text-lg pb-2">{title}</h1>
      <h4 className="text-xs text-gray-400">{subtitle}</h4>
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
          'font-semibold text-white rounded p-2 flex flex-row text-center items-center justify-center mr-4';
        const dangerClass = `bg-red-500 ${baseButtonClass}`;
        const infoClass = `bg-blue-600 ${baseButtonClass}`;
        const buttonClass = action.danger ? dangerClass : infoClass;
        return (
          <button
            className={buttonClass}
            onClick={action?.fn ? (e) => action.fn(e) : undefined}
            key={`fb-${idx}`}
          >
            {actionIcon}
            <div className="">{action?.title}</div>
          </button>
        );
      })
    : null;

  const footer = (
    <div className="py-2">
      <div className="flex flex-row-reverse">{actionsMarkup}</div>
    </div>
  );

  const headerMarkup = title ? titleMarkup : null;
  const footerMarkup = actions.length ? footer : null;
  return (
    <div className="flex flex-col sm:max-w-2xl bg-white dark:bg-gray-900 dark:text-gray-400 rounded-lg shadow shadow-md border-transparent">
      {headerMarkup}
      {children}
      {footerMarkup}
    </div>
  );
};

export default Card;
