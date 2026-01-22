import { Check, Code, Copy, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

interface MenuPreviewDialogProps {
  macAddress: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenuPreviewDialog({
  macAddress,
  open,
  onOpenChange,
}: MenuPreviewDialogProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchPreview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/boot/${encodeURIComponent(macAddress)}`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const text = await response.text();
      setContent(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && macAddress) {
      fetchPreview();
    }
  }, [open, macAddress]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <DialogTitle>iPXE Boot Script Preview</DialogTitle>
          </div>
          <DialogDescription>
            Generated iPXE script for{' '}
            <code className="font-mono text-xs">{macAddress}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPreview}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!content || isLoading}
          >
            {copied ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>

        <div className="flex-1 overflow-auto rounded-md border bg-muted/50 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              Loading...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32 text-destructive">
              {error}
            </div>
          ) : (
            <pre className="font-mono text-xs whitespace-pre-wrap break-all">
              {content}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
