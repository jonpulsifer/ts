'use client';
import { Badge, Switch } from '@repo/ui';
import { useOptimistic, useRef } from 'react';

export enum AvialableStatuses {
  Busy = 'Busy',
  Available = 'Available',
}

export type Status = {
  name: string;
  status: AvialableStatuses;
};

type Props = {
  statuses: Status[];
  name: string;
  updateStatus: (status: string) => Promise<void>;
};

const Status = ({ statuses, updateStatus, name }: Props) => {
  const [optimisticStatuses, setOptimisticStatus] = useOptimistic(
    statuses,
    // updateFn aka merge and return new state with optimistic value
    (state, status: Status) => {
      return [...state, status];
    },
  );

  const current = statuses.find((s) => s.name === name);
  const busy = current?.status === AvialableStatuses.Busy;

  const form = useRef<HTMLFormElement>(null);
  const update = async (formData?: FormData) => {
    const formStatus = formData?.get('status') as AvialableStatuses;
    const status = formStatus
      ? AvialableStatuses.Busy
      : AvialableStatuses.Available;
    setOptimisticStatus({
      name,
      status,
    });
    await updateStatus(status);
  };

  const click = (e: React.MouseEvent) => {
    e.preventDefault();
    updateStatus(busy ? AvialableStatuses.Available : AvialableStatuses.Busy);
  };

  const bg = busy ? 'bg-red-400/20' : '';

  return (
    <div>
      <form action={update} ref={form}>
        <div
          className={`${bg} flex flex-col justify-center items-center rounded-md`}
        >
          <p className="text-2xl font-bold mt-2">{name}</p>
          <div className="my-5">
            <Switch
              color="red"
              name="status"
              checked={busy}
              onClick={(e) => click(e)}
              type="submit"
              className="scale-200"
            />
          </div>
        </div>
        <div className="rounded-md space-y-2 mt-4">
          {optimisticStatuses &&
            optimisticStatuses.map(({ name, status }, index) => {
              const isBusy = status === AvialableStatuses.Busy;
              const bg = isBusy ? 'bg-red-400/20' : '';
              return (
                <div
                  key={name + index}
                  className={`${bg} p-2 flex justify-between items-center rounded-md`}
                >
                  <p className="font-semibold text-lg">{name}</p>
                  <Badge color={isBusy ? 'red' : 'green'}>
                    <p className="text-lg">{status}</p>
                  </Badge>
                </div>
              );
            })}
        </div>
      </form>
    </div>
  );
};

export default Status;
