import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@radix-ui/react-separator';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import RequestHeaders from './_components/request-headers';

export default async function RequestHeadersPage() {
  const headersList = await headers();
  const requestHeaders = Object.fromEntries(
    Array.from(headersList.entries()).sort(([a], [b]) => a.localeCompare(b)),
  );

  const starColor = 'text-yellow-300 hover:animate-ping hover:text-pink-600';

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Request Headers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <h1 className="text-md sm:text-2xl md:text-3xl lg:text-4xl tracking-tight font-extrabold pt-4 mb-4">
        <span>(∩ ͡° ͜ʖ ͡°)⊃</span>
        <span className="text-indigo-600">━</span>
        <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
          <span className={starColor}>⭑</span>·~-.¸.·~
          <span className={starColor}>⭒</span>·._.·
        </span>
        <span className={starColor}>☆</span>
      </h1>
      <Suspense fallback={<Skeleton className="w-full h-[500px]" />}>
        <RequestHeaders requestHeaders={requestHeaders} />
      </Suspense>
    </div>
  );
}
