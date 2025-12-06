import { Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { getBucket } from '@/lib/gcs-client';
import GcpAuth from './_components/gcp-auth';

// Force dynamic rendering since this page requires runtime GCP authentication
export const dynamic = 'force-dynamic';

export default async function GcpPage() {
  let results: {
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

  let bucketName: string | undefined;
  try {
    const bucket = await getBucket();
    bucketName = bucket.name;

    // List files from the bucket (limit to 20 for display)
    const [files] = await bucket.getFiles({ maxResults: 20 });

    // Fetch metadata for each file
    const fileList = await Promise.all(
      files.map(async (file) => {
        const [metadata] = await file.getMetadata();
        return {
          name: file.name,
          size: metadata.size
            ? formatBytes(
                typeof metadata.size === 'string'
                  ? Number.parseInt(metadata.size, 10)
                  : metadata.size,
              )
            : 'Unknown',
          updated: metadata.updated
            ? new Date(metadata.updated).toLocaleString()
            : 'Unknown',
          contentType: metadata.contentType || 'Unknown',
        };
      }),
    );

    results = {
      success: true,
      files: fileList,
      totalFiles: fileList.length,
    };
  } catch (error) {
    results = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to list files from bucket',
    };
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Google Cloud Storage"
        description="View files from your GCP storage bucket"
      />
      <Suspense fallback={<Skeleton className="w-full h-[500px]" />}>
        <GcpAuth storageData={results} bucketName={bucketName} />
      </Suspense>
    </div>
  );
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}
