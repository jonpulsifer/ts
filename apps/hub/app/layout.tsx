import './globals.css';
import '@repo/ui/styles.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Headerz',
  description: 'A little app that returns headers and things',
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
      <body
        className={`bg-zinc-200 dark:bg-slate-950 ${inter.className} text-black dark:text-white`}
      >
        <main className="p-1">{children}</main>
      </body>
    </html>
  );
}

export default Layout;
