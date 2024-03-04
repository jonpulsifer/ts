import type { Metadata } from 'next';

import { getInitialProps, updateStatus } from './actions';
import Chat from './components/chat';
import Status from './components/status';

export const metadata: Metadata = {
  title: 'Home Hub',
  description: 'A little application that helps us live in modern times.',
};

const Home = async () => {
  const { statuses, name } = await getInitialProps();
  return (
    <div className="flex flex-col sm:flex-row w-full h-full gap-2">
      <div className="w-full">
        <Status statuses={statuses} name={name} updateStatus={updateStatus} />
      </div>
      <div className="w-full">
        <Chat />
      </div>
    </div>
  );
};

export default Home;
