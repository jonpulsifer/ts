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
import { HostActions } from './_components/host-actions';
import { NewHostDialog } from './_components/new-host-dialog';

export const dynamic = 'force-dynamic';

export default async function HostsPage() {
  const [hosts, profiles] = await Promise.all([getHosts(), getProfiles()]);

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight lowercase">
            hosts
          </h1>
          <p className="text-muted-foreground font-mono">
            manage network boot hosts by mac address
          </p>
        </div>
        <NewHostDialog profiles={profiles}>
          <Button variant="spore">
            <Plus className="mr-2 h-4 w-4" />
            add host
          </Button>
        </NewHostDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>registered hosts</CardTitle>
          <CardDescription>
            {hosts.length} host{hosts.length !== 1 ? 's' : ''} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hosts registered yet. Hosts will auto-register when they boot
              via iPXE, or you can add them manually.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full font-mono">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium uppercase tracking-wider text-xs">
                      Hostname
                    </th>
                    <th className="pb-3 font-medium uppercase tracking-wider text-xs">
                      MAC Address
                    </th>
                    <th className="pb-3 font-medium uppercase tracking-wider text-xs">
                      Profile
                    </th>
                    <th className="pb-3 font-medium uppercase tracking-wider text-xs">
                      Last Seen
                    </th>
                    <th className="pb-3 font-medium uppercase tracking-wider text-xs">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {hosts.map((host) => {
                    const profile = host.profileId
                      ? profileMap.get(host.profileId)
                      : null;

                    return (
                      <tr
                        key={host.macAddress}
                        className="text-sm hover:bg-secondary/50 transition-colors"
                      >
                        <td className="py-4">
                          <Link
                            href={`/hosts/${encodeURIComponent(host.macAddress)}`}
                            className="font-medium text-spore hover:text-spore/80 hover:underline"
                          >
                            {host.hostname || (
                              <span className="text-muted-foreground italic">
                                unnamed
                              </span>
                            )}
                          </Link>
                        </td>
                        <td className="py-4 text-sm tracking-wide">
                          {host.macAddress}
                        </td>
                        <td className="py-4">
                          {profile ? (
                            <Link
                              href={`/profiles/${profile.id}`}
                              className="hover:underline"
                            >
                              <Badge
                                variant={
                                  profile.isDefault ? 'spore' : 'secondary'
                                }
                              >
                                {profile.name}
                              </Badge>
                            </Link>
                          ) : (
                            <Badge variant="outline">default</Badge>
                          )}
                        </td>
                        <td className="py-4 text-muted-foreground">
                          {timeAgo(host.lastSeen)}
                        </td>
                        <td className="py-4">
                          <HostActions host={host} profiles={profiles} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
