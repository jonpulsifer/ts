import { PageHeader } from '@/components/page-header';
import Fetcher from './_components/fetcher';

export default function FetcherPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="API Fetcher"
        description="Test API endpoints with different HTTP methods and inspect responses"
      />
      <Fetcher />
    </div>
  );
}
