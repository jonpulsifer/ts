'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createProjectAction } from '@/lib/actions';
import { BASE_URL } from '@/lib/base-url';
import { slugSchema } from '@/lib/slug-schema';

export function CreateProjectForm() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validation
    const validationResult = slugSchema.safeParse(slug);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      const errorMessage = firstError?.message || 'Invalid slug format';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Convert to lowercase
    value = value.toLowerCase();

    // Convert spaces to dashes
    value = value.replace(/\s+/g, '-');

    // Replace any invalid characters (not a-z, 0-9, or dash) with dashes
    value = value.replace(/[^a-z0-9-]/g, '-');

    // Collapse multiple consecutive dashes into a single dash
    value = value.replace(/-+/g, '-');

    // Limit to 32 characters
    value = value.slice(0, 32);

    // Allow dashes to be typed - don't remove leading/trailing dashes while typing
    // Validation will happen on submit
    setSlug(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="slug">Project Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={handleInputChange}
          placeholder="my-webhook-test"
          required
          maxLength={32}
          title="Use only lowercase letters, numbers, and hyphens (1-32 characters). Cannot start or end with a dash. Spaces will be converted to dashes."
          className="font-mono"
        />
        <p className="text-sm text-muted-foreground">
          Your webhook URL will be:{' '}
          <code className="bg-muted px-1 rounded">
            {slug ? `${BASE_URL}/api/${slug}` : `${BASE_URL}/api/[slug]`}
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
