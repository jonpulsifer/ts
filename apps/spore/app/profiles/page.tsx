import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getHosts, getProfiles } from '@/lib/actions';
import { timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ProfilesPage() {
  const [profiles, hosts] = await Promise.all([getProfiles(), getHosts()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profiles</h1>
          <p className="text-muted-foreground">Manage iPXE boot profiles</p>
        </div>
        <Link href="/profiles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Profile
          </Button>
        </Link>
      </div>

      {profiles.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No profiles created yet</p>
            <Link href="/profiles/new">
              <Button className="mt-4">Create your first profile</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => {
            const hostCount = hosts.filter(
              (h) => h.profileId === profile.id,
            ).length;

            return (
              <Link key={profile.id} href={`/profiles/${profile.id}`}>
                <Card className="h-full transition-colors hover:bg-accent/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{profile.name}</CardTitle>
                      {profile.isDefault && (
                        <Badge variant="default">Default</Badge>
                      )}
                    </div>
                    {profile.description && (
                      <CardDescription className="line-clamp-2">
                        {profile.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {hostCount} host{hostCount !== 1 ? 's' : ''}
                      </span>
                      <span>Updated {timeAgo(profile.updatedAt)}</span>
                    </div>
                    <pre className="mt-3 max-h-24 overflow-hidden rounded bg-muted p-2 text-xs">
                      {profile.content.slice(0, 200)}
                      {profile.content.length > 200 && '...'}
                    </pre>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
