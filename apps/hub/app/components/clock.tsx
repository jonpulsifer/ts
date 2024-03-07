'use client';
import { Card } from '@repo/ui';
import { useEffect, useState } from 'react';

const Clock = () => {
  const [time, setTime] = useState(''); // Start with null, will not be rendered server-side

  useEffect(() => {
    // Set initial time as soon as the component mounts
    const now = new Date().toLocaleTimeString([], { timeStyle: 'short' });
    setTime(now);

    // Then update it every minute
    const interval = setInterval(() => {
      setTime(now);
    }, 60_000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <div className="text-4xl font-bold text-black dark:text-white text-center">
        {time ? time : 'reticulating splines...'}
      </div>
    </Card>
  );
};

export default Clock;
