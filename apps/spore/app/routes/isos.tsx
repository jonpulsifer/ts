import { Disc3, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { getIsos } from '~/lib/actions';
import type { Route } from './+types/isos';

export const meta: Route.MetaFunction = () => [{ title: 'ISOs - Spore' }];

export async function loader() {
  const isos = await getIsos();
  return { isos };
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return '-';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export default function Isos({ loaderData }: Route.ComponentProps) {
  const { isos } = loaderData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">ISO Images</h1>
          <p className="text-muted-foreground">
            Manage bootable ISO images for your profiles.
          </p>
        </div>
        <Button asChild>
          <Link to="/isos/new">
            <Plus className="h-4 w-4 mr-2" />
            Add ISO
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Disc3 className="h-5 w-5 text-primary" />
            <CardTitle>All ISOs</CardTitle>
          </div>
          <CardDescription>
            Click on an ISO to view or edit its configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-32">
                    <div className="text-muted-foreground">
                      No ISOs yet. Add one to get started.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                isos.map((iso) => (
                  <TableRow key={iso.id}>
                    <TableCell>
                      <Link
                        to={`/isos/${iso.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {iso.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${
                          iso.source === 'upload'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-blue-500/10 text-blue-500'
                        }`}
                      >
                        {iso.source === 'upload' ? 'Uploaded' : 'URL'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatBytes(iso.sizeBytes)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {iso.updatedAt
                        ? new Date(iso.updatedAt).toLocaleString()
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
