import { Button } from '@repo/ui';
import type { CardAction } from '@repo/ui/card';

interface Props {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: CardAction | CardAction[];
}
export function EmptyState({ children, title, subtitle, action }: Props) {
  const actions: CardAction[] = [];
  if (action && Array.isArray(action)) {
    actions.push(...action);
  } else if (action) {
    actions.push(action);
  }

  const actionsMarkup = actions.length
    ? actions.map((action, idx) => {
        const actionIcon = action.icon ? <action.icon width={20} /> : null;
        return (
          <Button
            color={action.color}
            href={action.link ? action.link : undefined}
            key={`fb-${idx}`}
            onClick={action.onClick ? action.onClick : undefined}
          >
            {actionIcon}
            {action.title}
          </Button>
        );
      })
    : null;
  return (
    <>
      <div
        className="absolute right-0 -z-10 w-1/2 h-1/2 
        bg-[url('/santa.png')] bg-origin-border bg-no-repeat bg-right-top"
      />
      <div className="flex flex-col items-center h-full justify-center">
        <div className="flex flex-col items-center gap-4">
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
        {action ? (
          <div className="flex flex-row gap-4">{actionsMarkup}</div>
        ) : null}
      </div>
    </>
  );
}

export default EmptyState;
