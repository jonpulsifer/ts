import { PageHeader } from '@/components/page-header';
import Environment from './_components/environment';

export default async function EnvironmentPage() {
  const serverEnv = Object.fromEntries(
    Object.entries(process.env)
      .filter(([key]) => !key.startsWith('NEXT_PUBLIC_'))
      .filter(([_, value]) => value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b)),
  ) as Record<string, string>;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Environment Variables"
        description="View server and client environment variables"
      />
      <Environment serverEnv={serverEnv} />
    </div>
  );
}
