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
import { Textarea } from '@/components/ui/textarea';
import { deleteScript, updateScript } from '@/lib/actions';
import type { Script } from '@/lib/db/schema';

interface ScriptEditFormProps {
  script: Script;
}

export function ScriptEditForm({ script }: ScriptEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const path = formData.get('path') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;

    try {
      await updateScript(script.id, {
        path: path.replace(/^\/+/, ''),
        description: description || null,
        content,
      });
      // If path changed, redirect to new path
      if (path !== script.path) {
        router.push(`/scripts/${path.replace(/^\/+/, '')}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update script');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete script "${script.path}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteScript(script.id);
      router.push('/scripts');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Script Details</CardTitle>
          <CardDescription>Edit script configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="path">Path</Label>
            <Input
              id="path"
              name="path"
              defaultValue={script.path}
              className="font-mono"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              name="description"
              defaultValue={script.description || ''}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Script Content</CardTitle>
          <CardDescription>
            iPXE script served at /api/scripts/{script.path}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            name="content"
            defaultValue={script.content}
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
              {isDeleting ? 'Deleting...' : 'Delete Script'}
            </Button>
            <div className="flex gap-4">
              <Link href="/scripts">
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
