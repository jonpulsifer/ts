import './globals.css';
import '@repo/ui/styles.css';

import { SidebarLayout } from '@repo/ui';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { NavBar, Sidebar } from './components/nav';

export const metadata: Metadata = {
  title: 'Galaxy',
  description: 'A little service catalog',
  robots: {
    index: false,
  },
  icons: 'favicon.ico',
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className="text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
      lang="en"
    >
      <body className={inter.className}>
        <SidebarLayout sidebar={<Sidebar />} navbar={<NavBar />}>
          {children}
        </SidebarLayout>
      </body>
    </html>
  );
}

export default Layout;
