export function timeAgo(date: Date) {
  const now = new Date();
  const secondsPast = (now.getTime() - date.getTime()) / 1000;

  const getPlural = (value: number, unit: string) => {
    return value === 1 ? `${value} ${unit} ago` : `${value} ${unit}s ago`;
  };

  if (secondsPast < 60) {
    return getPlural(Math.round(secondsPast), 'second');
  }
  if (secondsPast < 3600) {
    return getPlural(Math.round(secondsPast / 60), 'minute');
  }
  if (secondsPast < 86400) {
    return getPlural(Math.round(secondsPast / 3600), 'hour');
  }
  if (secondsPast < 604800) {
    return getPlural(Math.round(secondsPast / 86400), 'day');
  }
  if (secondsPast < 2419200) {
    return getPlural(Math.round(secondsPast / 604800), 'week');
  }
  if (secondsPast < 29030400) {
    return getPlural(Math.round(secondsPast / 2419200), 'month');
  }
  return getPlural(Math.round(secondsPast / 29030400), 'year');
}
