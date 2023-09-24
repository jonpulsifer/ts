export const BadgeCounter = (name = 'thing', arr: unknown[]) => {
  const count = arr.length;
  const label = count > 1 || count === 0 ? `${name}s` : name;
  const baseFontColor =
    'text-indigo-700 dark:text-indigo-500 bg-indigo-50 dark:bg-slate-950 ring-indigo-700/10 dark:ring-indigo-500/10';
  const fontColor =
    count > 0 && count < 3
      ? 'text-red-700 dark:text-red-500 bg-red-50 dark:bg-red-950 ring-red-700/10 dark:ring-red-500/10'
      : count > 2 && count < 5
      ? 'text-yellow-700 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950 ring-yellow-700/10 dark:ring-yellow-500/10'
      : count > 4
      ? 'text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-950 ring-green-700/10 dark:ring-green-500/10'
      : baseFontColor;
  const baseClass = `flex-none w-16 justify-center inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${fontColor}`;

  return (
    <div className={baseClass}>
      {count} {label}
    </div>
  );
};
