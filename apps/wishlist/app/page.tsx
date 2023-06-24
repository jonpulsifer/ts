import { getCurrentUser } from 'lib/firebase-ssr';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import LoginPage from './login/page';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to to the wishlist',
};

const Home = async () => {
  const { user } = await getCurrentUser();
  if (user) redirect('/people');
  return <LoginPage />;
};

export default Home;
