import './globals.css';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Headerz',
  description: 'A little app that returns headers and things',
  viewport: 'width=device-width, initial-scale=1',
  robots: {
    index: false,
  },
  icons: 'favicon.ico',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
