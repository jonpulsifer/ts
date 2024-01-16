import './globals.css';
import '@repo/ui/styles.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { SessionProvider } from './providers';

export const metadata: Metadata = {
  title: 'Sandbox',
  description: 'My little application Sandbox',
  // viewport: 'width=device-width, initial-scale=1',
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
    <html lang="en">
      <SessionProvider>
        <body
          className={`bg-gray-200 dark:bg-slate-950 dark:text-zinc-200 ${inter.className}`}
        >
          <main className="mx-auto max-w-7xl sm:px-6 lg:px-8">{children}</main>
        </body>
      </SessionProvider>
    </html>
  );
}

export default Layout;
