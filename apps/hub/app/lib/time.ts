export const howLongAgo = (timestamp: number) => {
  const now = new Date();
  const differenceInMinutes = Math.floor(
    (now.valueOf() - timestamp.valueOf()) / (1000 * 60),
  );

  if (differenceInMinutes < 1) {
    return 'Just now';
  } else if (differenceInMinutes === 1) {
    return '1 minute ago';
  } else if (differenceInMinutes < 60) {
    return `${differenceInMinutes} minutes ago`;
  } else if (differenceInMinutes >= 60 && differenceInMinutes < 120) {
    return '1 hour ago';
  } else if (differenceInMinutes < 1440) {
    return `${Math.floor(differenceInMinutes / 60)} hours ago`;
  } else if (differenceInMinutes < 2880) {
    return '1 day ago';
  } else {
    // For messages over 1 day, you could return the exact time or a different message.
    // Adjust this return statement as needed.
    return 'over 1 day ago 💀';
  }
};
