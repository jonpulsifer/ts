'use client';

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
import { deleteProfile, updateProfile } from '@/lib/actions';
import type { Profile } from '@/lib/db/schema';

interface ProfileEditFormProps {
  profile: Profile;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
      await updateProfile(profile.id, {
        name,
        description: description || null,
        content,
        isDefault,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Delete profile "${profile.name}"? Hosts using this profile will be unassigned.`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProfile(profile.id);
      router.push('/profiles');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Edit profile configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={profile.name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              name="description"
              defaultValue={profile.description || ''}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="isDefault">Default Profile</Label>
              <p className="text-sm text-muted-foreground">
                Used for hosts without an assigned profile
              </p>
            </div>
            <Switch
              id="isDefault"
              name="isDefault"
              defaultChecked={profile.isDefault || false}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>iPXE Script</CardTitle>
          <CardDescription>
            The boot script content served to hosts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            name="content"
            defaultValue={profile.content}
            className="min-h-[400px] font-mono text-sm"
            required
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Profile'}
            </Button>
            <div className="flex gap-4">
              <Link href="/profiles">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
