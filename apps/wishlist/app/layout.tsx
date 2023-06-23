import './globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

import { AuthProvider } from 'components/AuthProvider';
import ErrorBoundary from 'components/ErrorBoundary';
import Toast from 'components/Toaster';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';

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

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html className="h-full w-full" lang="en">
      <body
        className={`h-full w-full bg-gray-200 dark:bg-slate-950 ${inter.className}`}
      >
        <ErrorBoundary>
          <main className="flex flex-col h-full w-full">
            <AuthProvider>{children}</AuthProvider>
            <Toast />
          </main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
