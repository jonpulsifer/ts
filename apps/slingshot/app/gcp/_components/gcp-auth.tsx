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

type StorageData = {
  success: boolean;
  files?: Array<{
    name: string;
    size: string;
    updated: string;
    contentType?: string;
  }>;
  totalFiles?: number;
  error?: string;
};

type GcpAuthProps = {
  storageData: StorageData;
  bucketName?: string;
};

export default function GcpAuth({ storageData, bucketName }: GcpAuthProps) {
  return (
    <div className="space-y-6">
      <Card className="w-full border-2 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Storage Bucket Files</CardTitle>
              <CardDescription className="mt-1">
                Files listed from bucket using authenticated GCP Storage client
              </CardDescription>
            </div>
            {storageData.success && (
              <Badge variant="default" className="text-sm">
                Success
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {storageData.success && storageData.files ? (
            <>
              <div className="space-y-2">
                {bucketName && (
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Bucket: {bucketName}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Showing up to 20 files from the storage bucket
                </p>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Files</div>
                  <Badge variant="secondary">
                    {storageData.totalFiles} file
                    {storageData.totalFiles !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">
                          File Name
                        </TableHead>
                        <TableHead className="font-semibold">Size</TableHead>
                        <TableHead className="font-semibold">
                          Content Type
                        </TableHead>
                        <TableHead className="font-semibold">
                          Last Updated
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {storageData.files.map((file, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-sm">
                            {file.name}
                          </TableCell>
                          <TableCell className="text-sm">{file.size}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {file.contentType}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {file.updated}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-destructive">
                Failed to List Files
              </div>
              {storageData.error && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-sm text-destructive font-mono">
                    {storageData.error}
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
