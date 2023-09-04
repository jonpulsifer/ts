'use client';
import {
  faArrowDown,
  faArrowRight,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React, { FormEvent, MouseEvent, useState } from 'react';

export interface AccordionAction {
  icon?: IconDefinition;
  title: string;
  danger?: boolean;
  secondary?: boolean;
  onClick?: ((e: MouseEvent | FormEvent) => void) | (() => void) | undefined;
  link?: string;
}

export interface AccordionProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badges?: React.ReactNode;
  children?: React.ReactNode;
  action?: AccordionAction | AccordionAction[];
  isOpen?: boolean;
}

const Accordion = ({
  title,
  subtitle,
  action,
  badges,
  isOpen = false,
  children,
}: AccordionProps): React.JSX.Element => {
  const [open, setOpen] = useState(isOpen);
  const height = open ? 'auto' : '0px';

  const toggleOpen = () => {
    setOpen(!open);
  };

  const OpenedArrow = (
    <FontAwesomeIcon
      icon={faArrowDown}
      onClick={toggleOpen}
      className="text-indigo-600 dark:text-indigo-800"
    />
  );

  const ClosedArrow = (
    <FontAwesomeIcon
      icon={faArrowRight}
      onClick={toggleOpen}
      className="text-indigo-600 dark:text-indigo-800"
    />
  );

  const icon = open ? OpenedArrow : ClosedArrow;

  const headerMarkup = (
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
      <div className="flex items-center text-2xl">{icon}</div>
    </div>
  );

  const actions: AccordionAction[] = [];
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
    <div className="border-t dark:border-slate-800 border-gray-200 bg-gray-50 dark:bg-slate-900 rounded-b-lg px-4 py-3 sm:flex sm:flex-row-reverse">
      {actionsMarkup}
    </div>
  );

  const footerMarkup = actions.length ? footer : null;
  return (
    <div
      className="flex flex-col sm:rounded-lg bg-white dark:bg-slate-900 sm:max-w-2xl dark:text-gray-400 shadow shadow-md overflow-hidden"
      onClick={toggleOpen}
    >
      <div className="sm:text-left">
        {headerMarkup}
        <div style={{ height: height }} className="overflow-x-scroll">
          {children}
        </div>
      </div>
      {footerMarkup}
    </div>
  );
};

export default Accordion;
