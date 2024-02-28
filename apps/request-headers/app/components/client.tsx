'use client';
import { Card } from '@repo/ui';
export default function ClientComponentWithEnvironmentVariables() {
  return (
    <Card
      title="Client Component"
      subtitle="Client environment variables are not available in the browser and are substituted at build."
    >
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className="text-left px-4 py-2">Item</th>
            <th className="text-left px-4 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr
            className="border-b dark:border-slate-800 border-zinc-200"
            key="NEXT_PUBLIC_VERCEL_ENV"
          >
            <td className="px-4 py-2">NEXT_PUBLIC_VERCEL_ENV</td>
            <td className="px-4 py-2 break-all">
              {process.env.NEXT_PUBLIC_VERCEL_ENV}
            </td>
          </tr>
          <tr
            className="border-b dark:border-slate-800 border-zinc-200"
            key="NEXT_PUBLIC_VERCEL_ENV"
          >
            <td className="px-4 py-2">NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA</td>
            <td className="px-4 py-2 break-all">
              {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
