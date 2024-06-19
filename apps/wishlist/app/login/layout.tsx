import { Metadata } from 'next/types';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to wishin.app to continue',
};

function Layout({ children }: { children: React.ReactNode }) {
  return <main className="flex flex-col h-full w-full">{children}</main>;
}
export default Layout;
