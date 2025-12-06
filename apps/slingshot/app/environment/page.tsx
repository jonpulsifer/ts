import { PageHeader } from '@/components/page-header';
import { sanitizeEnvVars } from '@/lib/sanitize-headers';
import Environment from './_components/environment';

export default async function EnvironmentPage() {
  // Vercel System Environment Variables
  // Reference: https://vercel.com/docs/environment-variables/system-environment-variables
  const VERCEL_SYSTEM_VARIABLES = [
    'VERCEL',
    'VERCEL_ENV',
    'VERCEL_URL',
    'VERCEL_REGION',
    'VERCEL_BRANCH_URL',
    'VERCEL_PROJECT_PRODUCTION_URL',
    'VERCEL_AUTOMATION_BYPASS_SECRET',
    'VERCEL_GIT_PROVIDER',
    'VERCEL_GIT_REPO_SLUG',
    'VERCEL_GIT_REPO_OWNER',
    'VERCEL_GIT_REPO_ID',
    'VERCEL_GIT_COMMIT_REF',
    'VERCEL_GIT_COMMIT_SHA',
    'VERCEL_GIT_COMMIT_MESSAGE',
    'VERCEL_GIT_COMMIT_AUTHOR_LOGIN',
    'VERCEL_GIT_COMMIT_AUTHOR_NAME',
    'VERCEL_GIT_PULL_REQUEST_ID',
  ];

  // Get all server-side environment variables (excluding NEXT_PUBLIC_* which are client-side)
  const allServerEnv = Object.fromEntries(
    Object.entries(process.env)
      .filter(([key]) => !key.startsWith('NEXT_PUBLIC_'))
      .filter(([_, value]) => value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b)),
  ) as Record<string, string>;

  // Ensure all Vercel system variables are included (even if undefined, for visibility)
  const serverEnv: Record<string, string> = { ...allServerEnv };
  VERCEL_SYSTEM_VARIABLES.forEach((key) => {
    if (process.env[key] !== undefined) {
      serverEnv[key] = process.env[key]!;
    }
  });

  // Sort again after adding Vercel system variables
  const sortedServerEnv = Object.fromEntries(
    Object.entries(serverEnv).sort(([a], [b]) => a.localeCompare(b)),
  );

  // Sanitize sensitive environment variables
  const sanitizedServerEnv = sanitizeEnvVars(sortedServerEnv);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Environment Variables"
        description="View server and client environment variables"
      />
      <Environment serverEnv={sanitizedServerEnv} />
    </div>
  );
}
