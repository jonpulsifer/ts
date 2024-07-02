export function timeAgo(date: Date) {
  const now = new Date();
  const secondsPast = (now.getTime() - date.getTime()) / 1000;

  const getPlural = (value: number, unit: string) => {
    return value === 1 ? `${value} ${unit} ago` : `${value} ${unit}s ago`;
  };

  if (secondsPast < 60) {
    return getPlural(Math.round(secondsPast), 'second');
  } else if (secondsPast < 3600) {
    return getPlural(Math.round(secondsPast / 60), 'minute');
  } else if (secondsPast < 86400) {
    return getPlural(Math.round(secondsPast / 3600), 'hour');
  } else if (secondsPast < 604800) {
    return getPlural(Math.round(secondsPast / 86400), 'day');
  } else if (secondsPast < 2419200) {
    return getPlural(Math.round(secondsPast / 604800), 'week');
  } else if (secondsPast < 29030400) {
    return getPlural(Math.round(secondsPast / 2419200), 'month');
  } else {
    return getPlural(Math.round(secondsPast / 29030400), 'year');
  }
}
