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
        ☢️ Nuke Chat
      </Button>
      <Button
        onClick={() => {
          window.location.reload();
        }}
      >
        🔄 Refresh
      </Button>
    </div>
  );
};
export default AdminButtons;
