import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import './globals.css';
import { NavProjectsSkeleton } from '@/components/projects-list-skeleton';
import { SidebarShell } from '@/components/sidebar-shell';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Slingshot - Webhook Testing Platform',
  description:
    'Catch webhooks in the wild • Inspect, debug, and replay with ease',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider defaultOpen={true}>
          <Suspense fallback={<NavProjectsSkeleton />}>
            <SidebarShell />
          </Suspense>
          <SidebarInset>
            <div
              className="flex min-h-svh flex-col bg-background"
              suppressHydrationWarning
            >
              <div className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur">
                <SidebarTrigger />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-semibold text-foreground truncate">
                    Slingshot
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    Webhook testing platform
                  </span>
                </div>
              </div>
              <main className="flex-1 overflow-auto px-4 pb-6 pt-4 md:px-6 md:pt-6">
                {/* Keep the previous route visible during client transitions to avoid flashes */}
                {children}
              </main>
            </div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
