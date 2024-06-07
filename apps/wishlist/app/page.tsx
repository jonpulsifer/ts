import { Nav } from 'components/layout-with-nav';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import PeoplePage from './(authenticated)/people/page';
import { auth } from './auth';

export const metadata: Metadata = {
  title: 'Login | wishin.app',
  description: 'Login to to the wishlist',
};

const Home = async () => {
  const session = await auth();
  if (session?.user) {
    return (
      <Nav>
        <PeoplePage />
      </Nav>
    );
  }
  redirect('/login');
};

export default Home;
