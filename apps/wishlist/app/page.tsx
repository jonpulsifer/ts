import { Metadata } from 'next';

import Login from './login/page';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to to the wishlist',
};

const Home = () => {
  return <Login />;
};

export default Home;
