'use client';

import './globals.css';
import 'react-toastify/dist/ReactToastify.min.css';
import { AuthProvider } from '../components/AuthProvider';
import { ToastContainer } from 'react-toastify';
import { Noto_Sans } from '@next/font/google';
import ErrorBoundary from '../components/ErrorBoundary';

const noto = Noto_Sans({ weight: '400' });
const bodyClassName = `${noto.className} bg-gradient-to-br from-violet-500 to-blue-900`;

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
