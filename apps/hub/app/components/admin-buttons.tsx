'use client';
import { Button } from '@repo/ui';

import { Message } from './chat';

interface Props {
  flushRedis: () => Promise<void>;
  fetchRecentMessages: () => Promise<Message[]>;
}

const AdminButtons = ({ flushRedis, fetchRecentMessages }: Props) => {
  return (
    <div className="flex justify-center gap-2">
      <Button
        color="red"
        onClick={async () => {
          await flushRedis();
          await fetchRecentMessages();
        }}
      >
        Flush Redis
      </Button>
      <Button
        color="sky"
        onClick={async () => {
          await fetchRecentMessages();
        }}
      >
        Fetch Messages
      </Button>
    </div>
  );
};
export default AdminButtons;
