import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from './auth';

export const metadata: Metadata = {
  title: 'wishin.app',
  description: 'A wishlist app for friends and family',
};

const Home = async () => {
  const session = await auth();
  if (session?.user) {
    redirect('/home');
  }
  redirect('/login');
};

export default Home;
