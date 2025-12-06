'use client';

import { useRouter } from 'next/navigation';
import { CreateProjectForm } from '@/components/create-project-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({
  open,
  onOpenChange,
}: CreateProjectModalProps) {
  const router = useRouter();

  const handleProjectCreated = (slug: string) => {
    // Close modal and navigate to the new project
    onOpenChange(false);
    router.push(`/${slug}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create Webhook Project
          </DialogTitle>
          <DialogDescription>
            Create a new project to receive webhooks at a unique endpoint
          </DialogDescription>
        </DialogHeader>
        <CreateProjectForm onSuccess={handleProjectCreated} />
      </DialogContent>
    </Dialog>
  );
}
