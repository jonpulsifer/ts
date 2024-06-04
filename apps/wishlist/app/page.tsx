import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { auth } from './auth';

export const metadata: Metadata = {
  title: 'Login | wishin.app',
  description: 'Login to to the wishlist',
};

const Home = async () => {
  const session = await auth();
  if (session?.user) {
    redirect('/people');
  }
  redirect('/login');
};

export default Home;
