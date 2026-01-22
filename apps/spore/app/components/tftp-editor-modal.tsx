import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Textarea } from '~/components/ui/textarea';

interface TftpEditorModalProps {
  path: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TftpEditorModal({
  path,
  open,
  onOpenChange,
}: TftpEditorModalProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (open) {
      setIsFetching(true);
      fetch(`/api/tftp/${path}`)
        .then((res) => res.json())
        .then((data) => {
          setContent(data.content || '');
          setIsFetching(false);
        })
        .catch(() => setIsFetching(false));
    }
  }, [open, path]);

  async function handleSave() {
    setIsLoading(true);
    const formData = new FormData();
    formData.set('content', content);

    await fetch(`/api/tftp/${path}`, {
      method: 'POST',
      body: formData,
    });

    setIsLoading(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit {path}</DialogTitle>
        </DialogHeader>
        {isFetching ? (
          <div className="flex items-center justify-center h-[60vh]">
            Loading...
          </div>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[60vh] font-mono text-sm"
            placeholder="File content..."
          />
        )}
        <Button onClick={handleSave} disabled={isLoading || isFetching}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
