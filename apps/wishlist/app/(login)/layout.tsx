import { Metadata } from 'next/types';

import Toast from '../../components/Toaster';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to wishin.app to continue',
};

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toast />
    </>
  );
}
export default Layout;
