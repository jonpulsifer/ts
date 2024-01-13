import './globals.css';
import 'ui/styles.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ErrorBoundary from 'components/ErrorBoundary';
import Toast from 'components/Toaster';
import { Metadata } from 'next';
import { Inter as Inter } from 'next/font/google';

import { SessionProvider } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | wishin.app',
    default: 'wishin.app', // a default is required when creating a template
  },
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html className="h-full w-full" lang="en">
      <body
        className={`h-full w-full bg-gray-200 dark:bg-slate-950 ${inter.className}`}
      >
        <ErrorBoundary>
          <SessionProvider>
            <main className="flex flex-col h-full w-full">
              {children}
              <Toast />
            </main>
          </SessionProvider>
        </ErrorBoundary>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
};

export default Layout;
