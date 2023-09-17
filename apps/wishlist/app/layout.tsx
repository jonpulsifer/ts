import './globals.css';
import 'ui/globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

import ErrorBoundary from 'components/ErrorBoundary';
import Page from 'components/Page';
import Toast from 'components/Toaster';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';

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
              <Page>{children}</Page>
              <Toast />
            </main>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
};

export default Layout;
