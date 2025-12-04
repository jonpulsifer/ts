import { PageHeader } from '@/components/page-header';
import NetworkTools from './_components/network-tools';

export default function NetworkToolsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Network Tools"
        description="Perform DNS lookups, WHOIS queries, ping tests, and SSL certificate inspections"
      />
      <NetworkTools />
    </div>
  );
}
