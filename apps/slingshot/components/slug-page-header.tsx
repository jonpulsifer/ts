'use client';

import { usePathname } from 'next/navigation';
import { PageHeader } from './page-header';

export function SlugPageHeader() {
  const pathname = usePathname();
  const slug = pathname.split('/').filter(Boolean)[0] || '';

  // Skip reserved routes
  if (slug === 'health' || slug === 'api' || slug === 'projects') {
    return (
      <PageHeader title="Not Found" description="This endpoint is reserved" />
    );
  }

  return (
    <PageHeader
      title={slug}
      description={`Webhook project • Endpoint: /api/${slug}`}
    />
  );
}
