export function timeSince(date1: Date, date2: Date): string {
  const diff = Math.abs(date2.getTime() - date1.getTime());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `📆 ${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `⏰ ${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `⏲️ ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (seconds > 0) {
    return `⏱️ ${seconds} second${seconds > 1 ? 's' : ''} ago`;
  }
  return '🔥 just now';
}
