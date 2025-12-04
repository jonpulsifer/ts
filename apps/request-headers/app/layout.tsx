import type { Metadata } from 'next';
import './globals.css';

import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  fallback: ['sans-serif'],
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  fallback: ['monospace'],
});

export const metadata: Metadata = {
  title: 'Request Headers - Developer Tools',
  description:
    'Modern developer tools for testing APIs, inspecting headers, webhooks, and network diagnostics',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${geist.variable} ${geistMono.variable}`}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <main className="flex-1 overflow-auto">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
