import './globals.css';
import '@repo/ui/styles.css';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ErrorBoundary from 'components/ErrorBoundary';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { SessionProvider } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: 'variable',
});

const title = 'wishin.app';
const description = 'A wishlist app for not everyone';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html className="h-full w-full" lang="en">
      <body
        className={`h-full w-full ${inter.className} bg-zinc-200 dark:text-zinc-100 dark:bg-zinc-900`}
      >
        <ErrorBoundary>
          <SessionProvider>
            <main className="flex flex-col h-full w-full">{children}</main>
          </SessionProvider>
        </ErrorBoundary>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
  title: {
    template: `%s | ${title}`,
    default: title,
  },
  description: description,
  openGraph: {
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: description,
    url: '/',
    siteName: title,
    locale: 'en_CA',
    type: 'website',
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/santa.png',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },
  manifest: '/site.webmanifest',
};

// these are the default values
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: 1,
};

export default Layout;
