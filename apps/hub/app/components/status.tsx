'use client';
import { Card, Switch } from '@repo/ui';
import { useState } from 'react';

const Status = () => {
  const [checked, setChecked] = useState(true);

  // red text in meeting
  // green text not in meeting
  // switch to toggle

  const status = checked ? 'In Meeting' : 'Free';

  return (
    <Card title="Meeting Status">
      <div className="flex flex-col justify-center items-center">
        <p className="text-2xl font-bold mb-10">{status}</p>

        <Switch
          color="red"
          checked={checked}
          onChange={setChecked}
          className=""
          style={{ transform: 'scale(4)' }}
        />
      </div>
    </Card>
  );
};

export default Status;
