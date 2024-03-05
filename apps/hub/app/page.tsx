import type { Metadata } from 'next';
import { Suspense } from 'react';

import {
  fetchNameAndStatuses,
  fetchRecentMessages,
  fetchRecentMessagesSWR,
  flushRedis,
  sendMessage,
  updateStatus,
} from './actions';
import AdminButtons from './components/admin-buttons';
import Chat from './components/chat';
import Status from './components/status';

export const metadata: Metadata = {
  title: 'Home Hub',
  description: 'A little application that helps us live in modern times.',
};

const Home = async () => {
  const { statuses, name } = await fetchNameAndStatuses();
  const messages = await fetchRecentMessages();
  return (
    <div className="flex flex-col sm:flex-row w-full h-full gap-2">
      <div className="w-full space-y-2">
        <Suspense fallback={<div>Loading...</div>}>
          <Status statuses={statuses} name={name} updateStatus={updateStatus} />
        </Suspense>
        <AdminButtons
          flushRedis={flushRedis}
          fetchRecentMessages={fetchRecentMessages}
        />
      </div>
      <div className="w-full">
        <Chat
          messages={messages}
          sendMessage={sendMessage}
          fetchMessages={fetchRecentMessagesSWR}
        />
      </div>
    </div>
  );
};

export default Home;
