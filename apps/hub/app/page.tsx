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

const Home = async () => {
  const { statuses, name } = await fetchNameAndStatuses();
  const messages = (await fetchRecentMessages()) || [];
  return (
    <div className="flex flex-col sm:flex-row w-full gap-1 overflow-y-scroll">
      <div className="flex flex-col w-full gap-1">
        <div className="flex-none">
          <Suspense>
            <Status
              statuses={statuses}
              name={name}
              updateStatus={updateStatus}
            />
          </Suspense>
        </div>
        <div className="flex-none">
          <Suspense>
            <Clock />
          </Suspense>
        </div>
        <AdminButtons flushRedis={flushRedis} />
      </div>
      <div className="flex flex-col w-full">
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
