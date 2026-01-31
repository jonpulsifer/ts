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
import { Textarea } from '@/components/ui/textarea';
import { createScript } from '@/lib/actions';

interface NewScriptDialogProps {
  children: React.ReactNode;
}

const defaultScript = `#!ipxe
# Script: {{path}}
# Available variables: {{mac}}, {{hostname}}, {{server_ip}}, {{base_url}}

echo Loading script...

# Add your iPXE commands here
`;

export function NewScriptDialog({ children }: NewScriptDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      await createScript({
        path: path.replace(/^\/+/, ''), // Remove leading slashes
        description: description || null,
        content,
      });
      setOpen(false);
      router.push(`/scripts/${path.replace(/^\/+/, '')}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create script');
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Script</DialogTitle>
          <DialogDescription>
            Create a chainable iPXE sub-script
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="path">Path</Label>
            <Input
              id="path"
              name="path"
              placeholder="k8s-node/netboot.ipxe"
              required
            />
            <p className="text-xs text-muted-foreground">
              Will be served at /api/scripts/[path]
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              name="description"
              placeholder="NixOS K8s node boot script"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Script Content</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={defaultScript}
              className="min-h-[250px] font-mono text-sm"
              required
            />
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
              {isSubmitting ? 'Creating...' : 'Create Script'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
