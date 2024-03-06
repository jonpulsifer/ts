import type { Metadata } from 'next';
import { Suspense } from 'react';

import {
  fetchNameAndStatuses,
  fetchRecentMessages,
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

const showAdminMode = process.env.NODE_ENV === 'development';

const Home = async () => {
  const { statuses, name } = await fetchNameAndStatuses();
  const messages = await fetchRecentMessages();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-full">
      <div className="space-y-2">
        <Suspense fallback={<div>Loading...</div>}>
          <Status statuses={statuses} name={name} updateStatus={updateStatus} />
        </Suspense>
        {showAdminMode ? <AdminButtons flushRedis={flushRedis} /> : null}
      </div>
      <div className="flex flex-col">
        <Chat
          name={name}
          messages={messages}
          sendMessage={sendMessage}
          fetchMessages={fetchRecentMessages}
        />
      </div>
    </div>
  );
};

export default Home;
