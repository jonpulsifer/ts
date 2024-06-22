export function timeAgo(date: Date) {
  const now = new Date();
  const secondsPast = (now.getTime() - date.getTime()) / 1000;

  if (secondsPast < 60) {
    return `${Math.round(secondsPast)} seconds ago`;
  } else if (secondsPast < 3600) {
    return `${Math.round(secondsPast / 60)} minutes ago`;
  } else if (secondsPast < 86400) {
    return `${Math.round(secondsPast / 3600)} hours ago`;
  } else if (secondsPast < 604800) {
    return `${Math.round(secondsPast / 86400)} days ago`;
  } else if (secondsPast < 2419200) {
    return `${Math.round(secondsPast / 604800)} weeks ago`;
  } else if (secondsPast < 29030400) {
    return `${Math.round(secondsPast / 2419200)} months ago`;
  } else {
    return `${Math.round(secondsPast / 29030400)} years ago`;
  }
}
