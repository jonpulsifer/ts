import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getAllProjects } from '@/lib/projects-storage';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Slingshot - Webhook Playground',
  description:
    'Catch webhooks in the wild • Inspect, debug, and replay with ease',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const projects = await getAllProjects();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider defaultOpen={true}>
          <AppSidebar projects={projects} />
          <SidebarInset>
            <main className="flex-1 overflow-auto bg-background">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
