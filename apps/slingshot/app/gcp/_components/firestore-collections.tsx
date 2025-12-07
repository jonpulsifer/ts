'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type CollectionsData = {
  success: boolean;
  collections?: Array<{
    name: string;
    documentCount: number;
    sampleDocuments?: Array<{
      id: string;
      type?: string;
      updatedAt?: string;
    }>;
  }>;
  error?: string;
};

type FirestoreCollectionsProps = {
  collectionsData: CollectionsData;
};

export default function FirestoreCollections({
  collectionsData,
}: FirestoreCollectionsProps) {
  if (!collectionsData.success) {
    return (
      <Card className="w-full border-2 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-destructive">
              Failed to List Collections
            </div>
            {collectionsData.error && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive font-mono">
                  {collectionsData.error}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (
    !collectionsData.collections ||
    collectionsData.collections.length === 0
  ) {
    return (
      <Card className="w-full border-2 shadow-lg">
        <CardContent className="p-6">
          <div className="text-sm text-muted-foreground">
            No collections found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {collectionsData.collections.map((collection, idx) => (
        <Card key={idx} className="w-full border shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-mono">
                {collection.name}
              </CardTitle>
              <Badge variant="secondary">
                {collection.documentCount}{' '}
                {collection.documentCount === 1 ? 'doc' : 'docs'}
              </Badge>
            </div>
          </CardHeader>
          {collection.sampleDocuments &&
            collection.sampleDocuments.length > 0 && (
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Count</TableHead>
                        <TableHead className="font-semibold">
                          Last Updated
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collection.sampleDocuments.map((doc, docIdx) => {
                        // Parse "type (count)" format
                        const match = doc.id.match(/^(.+?)\s+\((\d+)\)$/);
                        const type = match ? match[1] : doc.type || doc.id;
                        const count = match
                          ? Number.parseInt(match[2], 10)
                          : null;

                        return (
                          <TableRow key={docIdx}>
                            <TableCell className="font-mono text-sm">
                              {type}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {count !== null ? count : '—'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {doc.updatedAt || '—'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            )}
        </Card>
      ))}
    </div>
  );
}
