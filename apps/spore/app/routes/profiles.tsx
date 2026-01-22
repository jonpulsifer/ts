import { Network, Plus } from 'lucide-react';
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
import { getProfiles } from '~/lib/actions';
import type { Route } from './+types/profiles';

export const meta: Route.MetaFunction = () => [{ title: 'Profiles - Spore' }];

export async function loader() {
  const profiles = await getProfiles();
  return { profiles };
}

export default function Profiles({ loaderData }: Route.ComponentProps) {
  const { profiles } = loaderData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Boot Profiles</h1>
          <p className="text-muted-foreground">
            Manage iPXE boot scripts for your network hosts.
          </p>
        </div>
        <Button asChild>
          <Link to="/profiles/new">
            <Plus className="h-4 w-4 mr-2" />
            New Profile
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle>All Profiles</CardTitle>
          </div>
          <CardDescription>
            Click on a profile to view or edit its configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-32">
                    <div className="text-muted-foreground">
                      No profiles yet. Create one to get started.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <Link
                        to={`/profiles/${profile.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {profile.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {profile.updatedAt
                        ? new Date(profile.updatedAt).toLocaleString()
                        : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {profile.createdAt
                        ? new Date(profile.createdAt).toLocaleString()
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
