import type { Metadata } from 'next';
import { Suspense } from 'react';

import {
  fetchNameAndStatuses,
  fetchRecentMessages,
  sendMessage,
  updateStatus,
} from './actions';
import Chat from './components/chat';
import Status from './components/status';

export const metadata: Metadata = {
  title: 'Home Hub',
  description: 'A little application that helps us live in modern times.',
};

export const revalidate = 10;

const Home = async () => {
  const { statuses, name } = await fetchNameAndStatuses();
  const messages = await fetchRecentMessages();
  return (
    <div className="flex flex-col sm:flex-row w-full h-full gap-2">
      <div className="w-full">
        <Suspense fallback={<div>Loading...</div>}>
          <Status statuses={statuses} name={name} updateStatus={updateStatus} />
        </Suspense>
      </div>
      <div className="w-full">
        <Chat messages={messages} sendMessage={sendMessage} />
      </div>
    </div>
  );
};

export default Home;
