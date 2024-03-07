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
import Clock from './components/clock';
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
    <div className="flex flex-col sm:flex-row w-full gap-1 overflow-y-scroll">
      <div className="flex flex-col w-full gap-1">
        {/* Left column - Clock and Status */}
        <div className="flex-none">
          {/* Status component */}
          <Suspense fallback={<div>Loading status...</div>}>
            <Status
              statuses={statuses}
              name={name}
              updateStatus={updateStatus}
            />
          </Suspense>
        </div>
        <div className="flex-none">
          {' '}
          {/* Clock component */}
          <Suspense fallback={<div>Loading clock...</div>}>
            <Clock />
          </Suspense>
        </div>
        {showAdminMode ? <AdminButtons flushRedis={flushRedis} /> : null}
      </div>
      <div className="flex flex-col w-full">
        {/* Right column - Chat */}
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
