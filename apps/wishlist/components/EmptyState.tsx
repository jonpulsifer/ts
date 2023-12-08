import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { CardAction } from 'ui';

interface Props {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: CardAction | CardAction[];
}
export const EmptyState = ({ children, title, subtitle, action }: Props) => {
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
        const dangerClass = `bg-red-500 ${baseButtonClass}`;
        const infoClass = `bg-indigo-600 ${baseButtonClass}`;
        const buttonClass = action.danger ? dangerClass : infoClass;
        const button = (
          <button
            className={buttonClass}
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
  return (
    <>
      <div
        className="absolute right-0 -z-10 w-1/2 h-1/2 
        bg-[url('/santa.png')] bg-origin-border bg-no-repeat bg-right-top"
      />
      <div className="flex flex-col items-center justify-center text-center h-full">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold text-black dark:text-slate-200">
            {title}
          </h1>
          <p className="text-black-400 dark:text-slate-200 font-semibold">
            {subtitle}
          </p>
        </div>
        <div className="text-gray-600 dark:text-slate-400 text-sm">
          {children}
        </div>
        {action && <div className="flex flex-row gap-4">{actionsMarkup}</div>}
      </div>
    </>
  );
};

export default EmptyState;
