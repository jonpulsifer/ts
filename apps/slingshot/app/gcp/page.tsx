import { Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getFirestore,
  shouldSkipFirestoreOperations,
} from '@/lib/firestore-client';
import FirestoreCollections from './_components/firestore-collections';

// Force dynamic rendering since this page requires runtime GCP authentication
export const dynamic = 'force-dynamic';

export default async function GcpPage() {
  let results: {
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

  try {
    if (shouldSkipFirestoreOperations()) {
      results = {
        success: true,
        collections: [],
      };
    } else {
      const firestore = await getFirestore();

      // Get the main 'slingshot' collection
      const slingshotCollection = firestore.collection('slingshot');
      const snapshot = await slingshotCollection.limit(100).get();

      // Group documents by type if they have one
      const documentsByType: Record<
        string,
        Array<{ id: string; updatedAt?: number }>
      > = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const type = data.type || 'unknown';
        if (!documentsByType[type]) {
          documentsByType[type] = [];
        }
        documentsByType[type].push({
          id: doc.id,
          updatedAt: data.updatedAt || data.createdAt,
        });
      });

      // Create collection info
      const collections = [
        {
          name: 'slingshot',
          documentCount: snapshot.size,
          sampleDocuments: Object.entries(documentsByType)
            .map(([type, docs]) => ({
              id: `${type} (${docs.length})`,
              type,
              updatedAt: docs[0]?.updatedAt
                ? new Date(docs[0].updatedAt).toLocaleString()
                : undefined,
            }))
            .slice(0, 20),
        },
      ];

      results = {
        success: true,
        collections,
      };
    }
  } catch (error) {
    results = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to list Firestore collections',
    };
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Firestore Collections"
        description="View collections and documents from your Firestore database"
      />
      <Suspense fallback={<Skeleton className="w-full h-[500px]" />}>
        <FirestoreCollections collectionsData={results} />
      </Suspense>
    </div>
  );
}
