'use client';

import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { deleteHost, updateHost } from '@/lib/actions';
import type { Host, Profile } from '@/lib/db/schema';

interface HostActionsProps {
  host: Host;
  profiles: Profile[];
}

export function HostActions({ host, profiles }: HostActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleProfileChange(value: string) {
    const profileId = value === 'none' ? null : Number.parseInt(value, 10);
    await updateHost(host.macAddress, { profileId });
  }

  async function handleDelete() {
    if (!confirm(`Delete host ${host.hostname || host.macAddress}?`)) return;
    setIsDeleting(true);
    try {
      await deleteHost(host.macAddress);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={host.profileId?.toString() || 'none'}
        onValueChange={handleProfileChange}
      >
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue placeholder="Select profile" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Default Menu</SelectItem>
          {profiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.id.toString()}>
              {profile.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isDeleting}
        className="h-8 w-8 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
