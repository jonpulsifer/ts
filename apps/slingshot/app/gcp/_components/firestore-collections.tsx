'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  return (
    <div className="space-y-6">
      <Card className="w-full border-2 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Firestore Collections</CardTitle>
              <CardDescription className="mt-1">
                Collections and documents from your Firestore database
              </CardDescription>
            </div>
            {collectionsData.success && (
              <Badge variant="default" className="text-sm">
                Success
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {collectionsData.success && collectionsData.collections ? (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Showing collections and document counts from Firestore
                </p>
              </div>
              <Separator />
              {collectionsData.collections.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No collections found
                </div>
              ) : (
                collectionsData.collections.map((collection, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">
                        Collection: {collection.name}
                      </div>
                      <Badge variant="secondary">
                        {collection.documentCount} document
                        {collection.documentCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    {collection.sampleDocuments &&
                      collection.sampleDocuments.length > 0 && (
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="font-semibold">
                                  Document ID / Type
                                </TableHead>
                                <TableHead className="font-semibold">
                                  Last Updated
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {collection.sampleDocuments.map((doc, docIdx) => (
                                <TableRow key={docIdx}>
                                  <TableCell className="font-mono text-sm">
                                    {doc.id}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {doc.updatedAt || 'N/A'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    {idx < collectionsData.collections!.length - 1 && (
                      <Separator className="my-6" />
                    )}
                  </div>
                ))
              )}
            </>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
