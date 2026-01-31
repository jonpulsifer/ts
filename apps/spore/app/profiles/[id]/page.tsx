import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getHosts, getProfile } from '@/lib/actions';
import { formatDate } from '@/lib/utils';
import { ProfileEditForm } from './_components/profile-edit-form';

export const dynamic = 'force-dynamic';

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const profileId = Number.parseInt(id, 10);

  if (Number.isNaN(profileId)) {
    notFound();
  }

  const [profile, hosts] = await Promise.all([
    getProfile(profileId),
    getHosts(),
  ]);

  if (!profile) {
    notFound();
  }

  const assignedHosts = hosts.filter((h) => h.profileId === profile.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/profiles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          {profile.isDefault && <Badge variant="default">Default</Badge>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfileEditForm profile={profile} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(profile.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(profile.updatedAt)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Hosts</CardTitle>
              <CardDescription>
                {assignedHosts.length} host
                {assignedHosts.length !== 1 ? 's' : ''} using this profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignedHosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hosts assigned to this profile
                </p>
              ) : (
                <ul className="space-y-2">
                  {assignedHosts.map((host) => (
                    <li key={host.macAddress}>
                      <Link
                        href={`/hosts/${encodeURIComponent(host.macAddress)}`}
                        className="text-sm hover:underline"
                      >
                        {host.hostname || host.macAddress}
                      </Link>
                      {host.hostname && (
                        <p className="font-mono text-xs text-muted-foreground">
                          {host.macAddress}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
