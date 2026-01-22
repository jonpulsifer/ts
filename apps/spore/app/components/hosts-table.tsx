import { Edit, Eye, Network, Plus } from 'lucide-react';
import { useState } from 'react';
import { useRevalidator } from 'react-router';
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
import type { Host, Profile } from '~/db/schema';
import { EditHostDialog } from './edit-host-dialog';
import { MenuPreviewDialog } from './menu-preview-dialog';

interface HostsTableProps {
  hosts: Host[];
  profiles: Profile[];
}

export function HostsTable({ hosts, profiles }: HostsTableProps) {
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewMac, setPreviewMac] = useState<string | null>(null);
  const revalidator = useRevalidator();

  const getProfileName = (profileId: number | null) => {
    if (!profileId) return 'None';
    return profiles.find((p) => p.id === profileId)?.name || 'Unknown';
  };

  const handleEditDialogClose = (open: boolean) => {
    if (!open) {
      setEditingHost(null);
      revalidator.revalidate();
    }
  };

  const handleCreateDialogClose = (open: boolean) => {
    if (!open) {
      setIsCreating(false);
      revalidator.revalidate();
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              <CardTitle>Network Hosts</CardTitle>
            </div>
            <Button size="sm" onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Host
            </Button>
          </div>
          <CardDescription>
            Manage your network hosts and their assigned boot profiles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MAC Address</TableHead>
                <TableHead>Hostname</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-48">
                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                      <pre className="text-xs leading-tight opacity-40">
                        {`
    ╔══════════════════════════════════╗
    ║   No hosts detected on network   ║
    ║                                  ║
    ║   Boot a machine with iPXE to    ║
    ║   register it automatically      ║
    ╚══════════════════════════════════╝
`}
                      </pre>
                      <p className="text-sm">
                        Waiting for PXE boot requests...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                hosts.map((host) => (
                  <TableRow key={host.macAddress}>
                    <TableCell className="font-mono text-xs">
                      {host.macAddress}
                    </TableCell>
                    <TableCell className="font-medium">
                      {host.hostname || '-'}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
                        {getProfileName(host.profileId)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {host.lastSeen
                        ? new Date(host.lastSeen).toLocaleString()
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setPreviewMac(host.macAddress)}
                          title="Preview iPXE script"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Preview</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditingHost(host)}
                          title="Edit host"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit existing host dialog */}
      {editingHost && (
        <EditHostDialog
          host={editingHost}
          profiles={profiles}
          open={!!editingHost}
          onOpenChange={handleEditDialogClose}
        />
      )}

      {/* Create new host dialog */}
      <EditHostDialog
        host={null}
        profiles={profiles}
        open={isCreating}
        onOpenChange={handleCreateDialogClose}
      />

      {/* Preview iPXE menu dialog */}
      {previewMac && (
        <MenuPreviewDialog
          macAddress={previewMac}
          open={!!previewMac}
          onOpenChange={(open) => !open && setPreviewMac(null)}
        />
      )}
    </>
  );
}
