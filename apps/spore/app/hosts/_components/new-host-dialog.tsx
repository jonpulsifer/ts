'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createHost } from '@/lib/actions';
import type { Profile } from '@/lib/db/schema';

interface NewHostDialogProps {
  profiles: Profile[];
  children: React.ReactNode;
}

export function NewHostDialog({ profiles, children }: NewHostDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const macAddress = formData.get('macAddress') as string;
    const hostname = formData.get('hostname') as string;
    const profileId = formData.get('profileId') as string;

    try {
      await createHost({
        macAddress,
        hostname: hostname || undefined,
        profileId:
          profileId && profileId !== 'none'
            ? Number.parseInt(profileId, 10)
            : undefined,
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create host');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Host</DialogTitle>
          <DialogDescription>
            Manually register a host by MAC address
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="macAddress">MAC Address</Label>
            <Input
              id="macAddress"
              name="macAddress"
              placeholder="aa:bb:cc:dd:ee:ff"
              required
              pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{12})$"
            />
            <p className="text-xs text-muted-foreground">
              Accepts formats: aa:bb:cc:dd:ee:ff, aa-bb-cc-dd-ee-ff, or
              aabbccddeeff
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostname">Hostname (optional)</Label>
            <Input id="hostname" name="hostname" placeholder="k8s-node-1" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileId">Boot Profile</Label>
            <Select name="profileId" defaultValue="none">
              <SelectTrigger>
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
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Host'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
