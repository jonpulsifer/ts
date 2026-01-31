import { Clock, FileCode, ScrollText, Server } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getHosts, getProfiles, getScripts, getSetting } from '@/lib/actions';
import { timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [hosts, profiles, scripts, serverOrigin] = await Promise.all([
    getHosts(),
    getProfiles(),
    getScripts(),
    getSetting('serverOrigin'),
  ]);

  const defaultProfile = profiles.find((p) => p.isDefault);
  const recentHosts = hosts.slice(0, 5);
  const assignedHosts = hosts.filter((h) => h.profileId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-mono font-bold tracking-tight lowercase">
          dashboard
        </h1>
        <p className="text-muted-foreground font-mono">
          ipxe boot manager overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-0 pb-2">
            <CardTitle className="text-sm">total hosts</CardTitle>
            <Server className="h-4 w-4 text-spore" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-spore">
              {hosts.length}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {assignedHosts.length} with profiles assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-0 pb-2">
            <CardTitle className="text-sm">boot profiles</CardTitle>
            <FileCode className="h-4 w-4 text-spore" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-spore">
              {profiles.length}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {defaultProfile
                ? `default: ${defaultProfile.name}`
                : 'no default set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-0 pb-2">
            <CardTitle className="text-sm">scripts</CardTitle>
            <ScrollText className="h-4 w-4 text-spore" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-spore">
              {scripts.length}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              chainable sub-scripts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-0 pb-2">
            <CardTitle className="text-sm">server origin</CardTitle>
            <Clock className="h-4 w-4 text-spore" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono truncate text-spore">
              {serverOrigin || 'not configured'}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              used for template variables
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>recent hosts</CardTitle>
            <CardDescription>
              hosts that recently booted via ipxe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentHosts.length === 0 ? (
              <p className="text-sm text-muted-foreground font-mono">
                no hosts have booted yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentHosts.map((host) => (
                  <div
                    key={host.macAddress}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <Link
                        href={`/hosts/${encodeURIComponent(host.macAddress)}`}
                        className="font-mono text-sm text-spore hover:text-spore/80 hover:underline"
                      >
                        {host.hostname || host.macAddress}
                      </Link>
                      {host.hostname && (
                        <p className="font-mono text-xs text-muted-foreground">
                          {host.macAddress}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {host.profileId ? (
                        <Badge variant="spore">assigned</Badge>
                      ) : (
                        <Badge variant="outline">unassigned</Badge>
                      )}
                      <span className="text-xs text-muted-foreground font-mono">
                        {timeAgo(host.lastSeen)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {hosts.length > 5 && (
              <Link
                href="/hosts"
                className="mt-4 block text-sm font-mono text-spore hover:text-spore/80 hover:underline"
              >
                view all {hosts.length} hosts →
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>boot profiles</CardTitle>
            <CardDescription>
              available ipxe boot configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profiles.length === 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-mono">
                  no profiles created yet
                </p>
                <Link
                  href="/profiles/new"
                  className="text-sm font-mono text-spore hover:text-spore/80 hover:underline"
                >
                  create your first profile →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <Link
                        href={`/profiles/${profile.id}`}
                        className="text-sm font-mono text-spore hover:text-spore/80 hover:underline"
                      >
                        {profile.name}
                      </Link>
                      {profile.description && (
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                          {profile.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {profile.isDefault && (
                        <Badge variant="spore">default</Badge>
                      )}
                      <span className="text-xs text-muted-foreground font-mono">
                        {hosts.filter((h) => h.profileId === profile.id).length}{' '}
                        hosts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Start */}
      {profiles.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>getting started</CardTitle>
            <CardDescription>set up your ipxe boot environment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 font-mono">
            <div className="space-y-2">
              <h3 className="font-medium text-spore">
                1. configure server origin
              </h3>
              <p className="text-sm text-muted-foreground">
                set your server ip in{' '}
                <Link
                  href="/settings"
                  className="text-spore hover:text-spore/80 hover:underline"
                >
                  settings
                </Link>{' '}
                so ipxe scripts can reference the correct urls.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-spore">
                2. create a default profile
              </h3>
              <p className="text-sm text-muted-foreground">
                create a{' '}
                <Link
                  href="/profiles/new"
                  className="text-spore hover:text-spore/80 hover:underline"
                >
                  boot profile
                </Link>{' '}
                with your ipxe menu and mark it as default.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-spore">3. configure dhcp</h3>
              <p className="text-sm text-muted-foreground">
                point your dhcp server to chain to{' '}
                <code className="rounded-sm bg-secondary px-1.5 py-0.5 text-sm text-spore">
                  http://{'<server>'}:3000/api/boot/${'${net0/mac}'}
                </code>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
