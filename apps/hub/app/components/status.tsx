'use client';
import { Card, Switch } from '@repo/ui';
import { useState } from 'react';

interface Props {
  statuses: Record<string, string>;
  name: string;
  updateStatus: (status: string) => Promise<string>;
}

const Status = ({
  statuses: statusesFromRedis,
  updateStatus,
  name: nameFromRedis,
}: Props) => {
  const statusFromName = statusesFromRedis[nameFromRedis];
  const [checked, setChecked] = useState(statusFromName === 'In Meeting');
  const [statuses, setStatuses] = useState(statusesFromRedis);

  const handleToggleChange = async (checked: boolean) => {
    const newStatus = checked ? 'Free' : 'In Meeting';
    const name = await updateStatus(newStatus);
    setChecked(!checked);
    const newStatuses = { ...statuses, [name]: newStatus };
    setStatuses(newStatuses);
  };

  const bg = checked ? 'bg-red-500/20' : '';

  return (
    <Card>
      <div
        className={`${bg} flex flex-col justify-center items-center mb-10 rounded-md shadow shadow-inner`}
      >
        <p className="text-2xl font-bold mt-2">{nameFromRedis}</p>
        <div className="pb-10">
          <Switch
            color="red"
            checked={checked}
            onChange={() => handleToggleChange(checked)}
            className="scale-150 mt-10"
          />
        </div>
      </div>
      <div className="rounded-md p-2">
        {Object.entries(statuses).map(([name, currentStatus]) => {
          const entryBg = checked ? 'bg-red-500/20' : '';
          return (
            <div
              key={name}
              className={`${entryBg} p-2 flex justify-between items-center rounded-md`}
            >
              <p>{name}</p>
              <Switch
                color="red"
                checked={currentStatus === 'In Meeting'}
                onChange={() => handleToggleChange(checked)}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default Status;
