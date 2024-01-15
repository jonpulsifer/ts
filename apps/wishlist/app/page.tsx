import type { Metadata } from 'next';

import LoginPage from './login/page';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to to the wishlist',
};

const Home = async () => {
  return <LoginPage />;
};

export default Home;
