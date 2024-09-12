export const howLongAgo = (timestamp: number) => {
  const now = new Date();
  const differenceInMinutes = Math.floor(
    (now.valueOf() - timestamp.valueOf()) / (1000 * 60),
  );

  if (differenceInMinutes < 1) {
    return 'Just now';
  }
  if (differenceInMinutes === 1) {
    return '1 minute ago';
  }
  if (differenceInMinutes < 60) {
    return `${differenceInMinutes} minutes ago`;
  }
  if (differenceInMinutes >= 60 && differenceInMinutes < 120) {
    return '1 hour ago';
  }
  if (differenceInMinutes < 1440) {
    return `${Math.floor(differenceInMinutes / 60)} hours ago`;
  }
  if (differenceInMinutes < 2880) {
    return '1 day ago';
  }
  // For messages over 1 day, you could return the exact time or a different message.
  // Adjust this return statement as needed.
  return 'over 1 day ago 💀';
};
