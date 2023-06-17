import './globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { AuthProvider } from '../components/AuthProvider';
import Toast from 'components/Toaster';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ErrorBoundary from '../components/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const bodyClassName = `${inter.className} bg-gradient-to-br from-violet-500 to-blue-900 dark:to-black dark:from-blue-950`;

export const metadata: Metadata = {
  title: {
    template: '%s | wishin.app',
    default: 'wishin.app', // a default is required when creating a template
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={bodyClassName}>
        <ErrorBoundary>
          <AuthProvider>
            <main className="flex flex-col min-h-screen">
              {children}
              <Toast />
            </main>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
