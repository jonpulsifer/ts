'use client';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';
export default function ClientComponentWithEnvironmentVariables() {
  return (
    <Card
      title="Client Component"
      subtitle="Client environment variables are not available in the browser and are substituted at build"
    >
      <Table className="min-w-full table-auto">
        <TableHead>
          <TableRow>
            <TableHeader className="text-left px-4 py-2">Item</TableHeader>
            <TableHeader className="text-left px-4 py-2">Value</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow key="NEXT_PUBLIC_VERCEL_ENV">
            <TableCell>NEXT_PUBLIC_VERCEL_ENV</TableCell>
            <TableCell>{process.env.NEXT_PUBLIC_VERCEL_ENV}</TableCell>
          </TableRow>
          <TableRow key="NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA">
            <TableCell>NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA</TableCell>
            <TableCell>
              {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
