'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createProjectAction } from '@/lib/actions';

interface CreateProjectButtonProps {
  slug: string;
}

export function CreateProjectButton({ slug }: CreateProjectButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const _result = await createProjectAction(slug);
      toast.success(`Project "${slug}" created!`);
      router.push(`/${slug}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button onClick={handleCreate} disabled={isCreating}>
      <Plus className="h-4 w-4 mr-2" />
      {isCreating ? 'Creating...' : 'Create Project'}
    </Button>
  );
}
