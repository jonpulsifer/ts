'use client';
import { Card, Switch } from '@repo/ui';
import { useEffect, useState } from 'react';

interface Props {
  statuses: Record<string, string>;
  name: string;
  updateStatus: (status: string) => Promise<void>;
}

const Status = ({
  statuses: statusesFromRedis,
  updateStatus,
  name: nameFromRedis,
}: Props) => {
  const [statuses, setStatuses] = useState(statusesFromRedis);

  useEffect(() => {
    setStatuses(statusesFromRedis);
  }, [statusesFromRedis]);

  const handleToggleChange = async (name: string) => {
    const currentStatus = statuses[name];
    const newStatus = currentStatus === 'In Meeting' ? 'Free' : 'In Meeting';
    await updateStatus(newStatus);
    setStatuses((prev) => ({ ...prev, [name]: newStatus }));
  };

  const unavailable = statuses[nameFromRedis] === 'In Meeting';
  const bg = unavailable ? 'bg-red-500/20' : '';

  return (
    <Card>
      <div
        className={`${bg} flex flex-col justify-center items-center mb-10 rounded-md`}
      >
        <p className="text-2xl font-bold mt-2">{nameFromRedis}</p>
        <div className="pb-10">
          <Switch
            color="red"
            checked={unavailable}
            onChange={() => handleToggleChange(nameFromRedis)}
            className="scale-400 mt-10"
          />
        </div>
      </div>
      <div className="rounded-md space-y-2">
        {Object.entries(statuses).map(([name, currentStatus]) => (
          <div
            key={name}
            className={`${
              currentStatus === 'In Meeting' ? 'bg-red-500/20' : ''
            } p-2 flex justify-between items-center rounded-md`}
          >
            <p>{name}</p>
            <Switch
              color="red"
              checked={currentStatus === 'In Meeting'}
              onChange={() => handleToggleChange(name)}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Status;
