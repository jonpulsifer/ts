import './globals.css';
import '@repo/ui/styles.css';

import type { Metadata } from 'next';
import { Creepster, Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const creepster = Creepster({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-creepster',
});

export const metadata: Metadata = {
  title: 'Headerz',
  description: 'A little app that returns headers and things',
  // viewport: 'width=device-width, initial-scale=1',
  robots: {
    index: false,
  },
  icons: 'favicon.ico',
};

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`bg-zinc-200 dark:bg-slate-950 ${inter.className} ${creepster.variable} text-black dark:text-white`}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}

export default Layout;
