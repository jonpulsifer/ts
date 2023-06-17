import Login from './login/page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to to the wishlist',
};

const Home = () => {
  return <Login />;
};

export default Home;
