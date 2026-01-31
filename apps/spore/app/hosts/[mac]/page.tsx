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
import { getHost, getProfiles } from '@/lib/actions';
import { formatDate } from '@/lib/utils';
import { HostEditForm } from './_components/host-edit-form';

export const dynamic = 'force-dynamic';

interface HostPageProps {
  params: Promise<{ mac: string }>;
}

export default async function HostPage({ params }: HostPageProps) {
  const { mac } = await params;
  const decodedMac = decodeURIComponent(mac);

  const [host, profiles] = await Promise.all([
    getHost(decodedMac),
    getProfiles(),
  ]);

  if (!host) {
    notFound();
  }

  const profile = host.profileId
    ? profiles.find((p) => p.id === host.profileId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hosts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {host.hostname || 'Unnamed Host'}
          </h1>
          <p className="font-mono text-muted-foreground">{host.macAddress}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Host Details</CardTitle>
            <CardDescription>View and edit host configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <HostEditForm host={host} profiles={profiles} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Boot Information</CardTitle>
            <CardDescription>Current boot configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Assigned Profile</p>
              {profile ? (
                <Link href={`/profiles/${profile.id}`}>
                  <Badge
                    variant={profile.isDefault ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {profile.name}
                  </Badge>
                </Link>
              ) : (
                <Badge variant="outline" className="mt-1">
                  Default Menu
                </Badge>
              )}
            </div>

            <div>
              <p className="text-sm font-medium">Last Seen</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(host.lastSeen)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Registered</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(host.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Boot URL</p>
              <code className="mt-1 block rounded bg-muted p-2 text-xs">
                /api/boot/{host.macAddress}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
