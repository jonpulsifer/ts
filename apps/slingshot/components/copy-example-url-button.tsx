'use client';

import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CopyExampleUrlButton({ url }: { url: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 shrink-0"
      onClick={() => {
        navigator.clipboard.writeText(url);
      }}
      title="Copy example URL"
    >
      <Copy className="h-4 w-4" />
    </Button>
  );
}
