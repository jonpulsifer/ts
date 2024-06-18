import { Badge } from '@repo/ui/badge';

const daysUntilChristmas = () => {
  const today = new Date();
  const christmas = new Date(today.getFullYear(), 11, 25);
  if (today.getMonth() === 11 && today.getDate() > 25) {
    christmas.setFullYear(christmas.getFullYear() + 1);
  }
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.ceil((christmas.getTime() - today.getTime()) / oneDay);
};

export const DaysUntilChristmasBadge = () => {
  const count = daysUntilChristmas();
  const color =
    count >= 0 && count < 30
      ? 'red'
      : count > 30 && count < 90
        ? 'yellow'
        : count > 90 && count < 180
          ? 'green'
          : 'indigo';
  return (
    <Badge color={color} className="justify-center">
      🎅 {count} day{count > 1 || count === 0 ? 's' : ''} to Christmas
    </Badge>
  );
};
