import type { Metadata } from 'next';

import Chat from './components/chat';
import Status from './components/status';

export const metadata: Metadata = {
  title: 'Home Hub',
  description: 'A little application that helps us live in modern times.',
};

const Home = () => {
  return (
    <>
      <Status />
      <Chat />
    </>
  );
};

export default Home;
