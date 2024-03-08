'use client';
import { Button } from '@repo/ui';

interface Props {
  flushRedis: () => Promise<void>;
}

const AdminButtons = ({ flushRedis }: Props) => {
  return (
    <div className="flex justify-center gap-2">
      <Button
        onClick={async () => {
          await flushRedis();
        }}
      >
        ☢️ Nuke Data
      </Button>
      <Button
        onClick={() => {
          window.location.reload();
        }}
      >
        🔄 Refresh Page
      </Button>
    </div>
  );
};
export default AdminButtons;
