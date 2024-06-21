import { Nav } from 'components/layout-with-nav';
import Toast from 'components/Toaster';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import HomePage from './(authenticated)/page';
import { auth } from './auth';

export const metadata: Metadata = {
  title: 'wishin.app',
  description: 'A wishlist app for friends and family',
};

const Home = async () => {
  const session = await auth();
  if (session?.user) {
    return (
      <Nav>
        <HomePage />
        <Toast />
      </Nav>
    );
  }
  redirect('/login');
};

export default Home;
