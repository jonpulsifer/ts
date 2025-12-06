'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createProjectAction } from '@/lib/actions';

export function CreateProjectForm() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await createProjectAction(slug);

      toast.success('Project created successfully');
      // Refresh the page to update sidebar
      router.refresh();
      // Redirect to the project page
      router.push(`/${result.slug}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const _handleGoToDefault = () => {
    router.push('/slingshot');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="slug">Project Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => {
            // Convert to lowercase and replace invalid characters with dashes
            let value = e.target.value
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, '-');
            // Remove leading dashes
            value = value.replace(/^-+/, '');
            // Remove trailing dashes
            value = value.replace(/-+$/, '');
            // Limit to 32 characters
            setSlug(value.slice(0, 32));
          }}
          placeholder="my-webhook-test"
          required
          pattern="[a-z0-9]([a-z0-9-]*[a-z0-9])?"
          minLength={1}
          maxLength={32}
          title="Use only lowercase letters, numbers, and hyphens (1-32 characters). Cannot start or end with a dash."
          className="font-mono"
        />
        <p className="text-sm text-muted-foreground">
          Your webhook URL will be:{' '}
          <code className="bg-muted px-1 rounded">
            {slug ? `/api/${slug}` : '/api/[slug]'}
          </code>
          {slug.length >= 32 && (
            <span className="block text-xs text-muted-foreground mt-1">
              Maximum 32 characters
            </span>
          )}
        </p>
      </div>
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}
      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading ? 'Creating...' : 'Create Project'}
      </Button>
    </form>
  );
}
