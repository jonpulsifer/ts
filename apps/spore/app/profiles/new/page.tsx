'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { createProfile } from '@/lib/actions';

const defaultScript = `#!ipxe

# Ensure we have an IP
dhcp

# Define the server
set server-ip {{server_ip}}
set base-url {{base_url}}

:start
menu iPXE Boot Menu - {{hostname}} ({{mac}})
item --gap --             -------------------------
item local                Boot from local disk
item shell                iPXE Shell
choose --default local --timeout 5000 target && goto \${target}

:local
exit

:shell
shell
`;

export default function NewProfilePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const isDefault = formData.get('isDefault') === 'on';

    try {
      const result = await createProfile({
        name,
        description: description || null,
        content,
        isDefault,
      });
      router.push(`/profiles/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/profiles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Profile</h1>
          <p className="text-muted-foreground">
            Create a new iPXE boot profile
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="K8s Node Boot"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Boot configuration for Kubernetes nodes"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="isDefault">Default Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Used for hosts without an assigned profile
                  </p>
                </div>
                <Switch id="isDefault" name="isDefault" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
              <CardDescription>Available in your iPXE scripts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="rounded bg-muted px-1">{'{{mac}}'}</code>
                  <span className="text-muted-foreground">
                    aa:bb:cc:dd:ee:ff
                  </span>
                </div>
                <div className="flex justify-between">
                  <code className="rounded bg-muted px-1">
                    {'{{mac_hyphen}}'}
                  </code>
                  <span className="text-muted-foreground">
                    aa-bb-cc-dd-ee-ff
                  </span>
                </div>
                <div className="flex justify-between">
                  <code className="rounded bg-muted px-1">
                    {'{{hostname}}'}
                  </code>
                  <span className="text-muted-foreground">Host hostname</span>
                </div>
                <div className="flex justify-between">
                  <code className="rounded bg-muted px-1">
                    {'{{profile_name}}'}
                  </code>
                  <span className="text-muted-foreground">Profile name</span>
                </div>
                <div className="flex justify-between">
                  <code className="rounded bg-muted px-1">
                    {'{{server_ip}}'}
                  </code>
                  <span className="text-muted-foreground">
                    Server IP address
                  </span>
                </div>
                <div className="flex justify-between">
                  <code className="rounded bg-muted px-1">
                    {'{{base_url}}'}
                  </code>
                  <span className="text-muted-foreground">Full server URL</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>iPXE Script</CardTitle>
              <CardDescription>
                The boot script that will be served to hosts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                name="content"
                defaultValue={defaultScript}
                className="min-h-[400px] font-mono text-sm"
                required
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-end gap-4">
                <Link href="/profiles">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
