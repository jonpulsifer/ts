'use client';

import { formatDistanceToNow } from 'date-fns';
import { Database, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  clearAllCachedWebhooks,
  clearCachedWebhooks,
  getAllCacheEntries,
} from '@/lib/webhook-cache';

export default function CachePage() {
  const [entries, setEntries] = useState<
    { slug: string; timestamp: number; count: number; size: number }[]
  >([]);
  const [mounted, setMounted] = useState(false);

  const loadCache = () => {
    const cacheEntries = getAllCacheEntries();
    setEntries(cacheEntries);
  };

  useEffect(() => {
    setMounted(true);
    loadCache();
  }, []);

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all cached data?')) {
      clearAllCachedWebhooks();
      loadCache();
      toast.success('All cache cleared');
    }
  };

  const handleClearOne = (slug: string) => {
    clearCachedWebhooks(slug);
    loadCache();
    toast.success(`Cache cleared for ${slug}`);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Cache Management"
        description="Manage local storage cache for offline access and performance"
        actions={
          entries.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleClearAll}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Cache
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Local Storage Cache
          </CardTitle>
          <CardDescription>
            View and manage cached webhook data stored in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Database className="h-12 w-12 mb-4 opacity-20" />
              <p>No cached data found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Webhooks</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.slug}>
                      <TableCell className="font-medium">
                        {entry.slug}
                      </TableCell>
                      <TableCell>{entry.count}</TableCell>
                      <TableCell>{formatBytes(entry.size)}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(entry.timestamp, {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleClearOne(entry.slug)}
                          title={`Clear cache for ${entry.slug}`}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
