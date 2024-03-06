import type { FormEvent, MouseEvent } from 'react';
import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import type { ButtonProps } from './button';
import { Button } from './button';

export interface CardAction {
  icon?: LucideIcon;
  title: string;
  href?: string;
  color?: ButtonProps['color'];
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
  className?: string;
}

export function Card({
  title,
  subtitle,
  action,
  badges,
  children,
  className,
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
          <div className="flex">
            <action.icon />
          </div>
        ) : null;

        return (
          <Button
            color={action.color ? action.color : undefined}
            form={action.submit ? action.submit : undefined}
            href={action.href ? action.href : ''}
            key={action.title}
            onClick={action.onClick ? action.onClick : undefined}
            type={action.submit ? 'submit' : 'button'}
          >
            {actionIcon}
            {action.title}
          </Button>
        );
      })
    : null;

  const footer = <div className="p-2 sm:p-4">{actionsMarkup}</div>;
  const header = <div className="p-2 sm:p-4">{headerContent}</div>;

  const headerMarkup = title ? header : null;
  const footerMarkup = actions.length ? footer : null;
  return (
    <div
      className={clsx(
        className,
        'divide-y dark:divide-slate-800 divide-gray-200 xs:rounded-lg bg-white dark:bg-slate-900 dark:text-gray-400 shadow shadow-md border-transparent max-h-fit',
      )}
    >
      {headerMarkup}
      <div className="p-2 sm:px-4 h-full">{children}</div>
      {footerMarkup}
    </div>
  );
}
