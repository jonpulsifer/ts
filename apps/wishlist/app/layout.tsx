'use client';

import './globals.css';
import 'react-toastify/dist/ReactToastify.min.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { AuthProvider } from '../components/AuthProvider';
import { ToastContainer } from 'react-toastify';
import { Inter } from 'next/font/google';
import ErrorBoundary from '../components/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});
const bodyClassName = `${inter.className} bg-gradient-to-br from-violet-500 to-blue-900 dark:to-black dark:from-blue-950`;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={bodyClassName}>
        <ErrorBoundary>
          <>
            <ToastContainer />
            <AuthProvider>
              <main className="flex flex-col min-h-screen">{children}</main>
            </AuthProvider>
          </>
        </ErrorBoundary>
      </body>
    </html>
  );
}
