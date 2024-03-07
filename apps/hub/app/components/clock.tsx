'use client';
import { Card } from '@repo/ui';
import { useEffect, useState } from 'react';

const Clock = () => {
  const [time, setTime] = useState<string>('THE TIME IS'); // Start with null, will not be rendered server-side

  useEffect(() => {
    // Set initial time as soon as the component mounts
    setTime(new Date().toLocaleTimeString());

    // Then update it every second
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <div className="text-4xl font-bold text-black dark:text-white text-center">
        {time}
      </div>
    </Card>
  );
};

export default Clock;
