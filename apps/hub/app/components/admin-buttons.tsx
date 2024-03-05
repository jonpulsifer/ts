'use client';
import { Button } from '@repo/ui';

interface Props {
  flushRedis: () => Promise<void>;
}

const AdminButtons = ({ flushRedis }: Props) => {
  return (
    <div className="flex justify-center gap-2">
      <Button
        color="red"
        onClick={async () => {
          await flushRedis();
        }}
      >
        Flush Redis
      </Button>
    </div>
  );
};
export default AdminButtons;
