'use client';

import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CodeBlockProps {
  label: string;
  code: string;
}

export function CodeBlock({ label, code }: CodeBlockProps) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">{label}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2"
          onClick={() => navigator.clipboard.writeText(code)}
        >
          <Copy className="h-4 w-4" />
          Copy
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm font-mono border border-border/50">
          {code}
        </pre>
      </CardContent>
    </Card>
  );
}
