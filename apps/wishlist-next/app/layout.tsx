import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const title = 'wishin.app';
const description = 'A wishlist app for not everyone';

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
    icon: '/favicon.svg',
    shortcut: '/santaicon.png',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
