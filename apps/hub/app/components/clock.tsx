'use client';
import { useEffect, useState } from 'react';

const now = () =>
  new Date()
    .toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/ ?(?:AM|PM)$/i, '');

const Clock = () => {
  const [time, setTime] = useState('⏰');
  useEffect(() => {
    const updateClock = () => setTime(now()); // Function to update time

    updateClock(); // Update immediately on mount

    const interval = setInterval(() => {
      updateClock(); // Update every minute
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-9xl leading-none text-center font-bold">{time}</div>
  );
};

export default Clock;
