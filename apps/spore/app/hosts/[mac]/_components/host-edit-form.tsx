'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { deleteHost, updateHost } from '@/lib/actions';
import type { Host, Profile } from '@/lib/db/schema';

interface HostEditFormProps {
  host: Host;
  profiles: Profile[];
}

export function HostEditForm({ host, profiles }: HostEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const hostname = formData.get('hostname') as string;
    const profileId = formData.get('profileId') as string;

    try {
      await updateHost(host.macAddress, {
        hostname: hostname || null,
        profileId:
          profileId && profileId !== 'none'
            ? Number.parseInt(profileId, 10)
            : null,
      });
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Delete host ${host.hostname || host.macAddress}? This cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteHost(host.macAddress);
      router.push('/hosts');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="macAddress">MAC Address</Label>
        <Input
          id="macAddress"
          value={host.macAddress}
          disabled
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hostname">Hostname</Label>
        <Input
          id="hostname"
          name="hostname"
          defaultValue={host.hostname || ''}
          placeholder="k8s-node-1"
        />
        <p className="text-xs text-muted-foreground">
          Available as {'{{hostname}}'} in boot scripts
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profileId">Boot Profile</Label>
        <Select
          name="profileId"
          defaultValue={host.profileId?.toString() || 'none'}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select profile" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Default Menu</SelectItem>
            {profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id.toString()}>
                {profile.name}
                {profile.isDefault && ' (Default)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Host'}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
