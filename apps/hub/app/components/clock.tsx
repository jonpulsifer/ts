'use client';
import { Card } from '@repo/ui';
import { useEffect, useState } from 'react';

const Clock = () => {
  const [time, setTime] = useState('00:00 PM' as string); // Start with null, will not be rendered server-side
  useEffect(() => {
    const now = new Date().toLocaleTimeString([], { timeStyle: 'short' });
    setTime(now);

    const interval = setInterval(() => {
      setTime(now);
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <div className="text-7xl leading-none text-center font-bold">{time}</div>
    </Card>
  );
};

export default Clock;
