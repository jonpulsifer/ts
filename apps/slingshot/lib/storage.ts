import type { Firestore } from '@google-cloud/firestore';
import {
  FIRESTORE_COLLECTION_NAME,
  WEBHOOKS_SUBCOLLECTION_NAME,
} from './constants';
import { getFirestore } from './firestore-client';
import { resetProjectStats } from './stats-storage';
import type { Webhook, WebhookHistory } from './types';

const MAX_WEBHOOKS = 100;
const COLLECTION = FIRESTORE_COLLECTION_NAME;

const ensureProjectDoc = async (firestore: Firestore, slug: string) => {
  const docRef = firestore.collection(COLLECTION).doc(slug);
  const snap = await docRef.get();
  if (!snap.exists) {
    await docRef.set({
      slug,
      createdAt: Date.now(),
      webhookCount: 0,
      lastWebhookTimestamp: null,
      updatedAt: Date.now(),
      webhooksUpdatedAt: Date.now(),
      type: 'project',
      maxSize: MAX_WEBHOOKS,
    });
  }
  return docRef;
};

export async function checkWebhooksChanged(
  slug: string,
): Promise<{ changed: boolean; etag: string | null; updated: number | null }> {
  try {
    const firestore = await getFirestore();
    const docRef = firestore.collection(COLLECTION).doc(slug);
    const snap = await docRef.get();
    if (!snap.exists) {
      return { changed: false, etag: null, updated: null };
    }
    const data = snap.data() || {};
    const updated =
      typeof data.webhooksUpdatedAt === 'number'
        ? data.webhooksUpdatedAt
        : null;
    return {
      changed: !!updated,
      etag: updated ? updated.toString() : null,
      updated,
    };
  } catch (_error) {
    return { changed: false, etag: null, updated: null };
  }
}

export async function getWebhooks(
  slug: string,
  _knownEtag?: string | null,
): Promise<{ data: WebhookHistory | null; etag: string | null }> {
  try {
    const firestore = await getFirestore();
    const docRef = await ensureProjectDoc(firestore, slug);
    const projectSnap = await docRef.get();
    const projectData = projectSnap.data() || {};
    const etag = projectData.webhooksUpdatedAt
      ? projectData.webhooksUpdatedAt.toString()
      : null;

    const webhooksSnap = await docRef
      .collection(WEBHOOKS_SUBCOLLECTION_NAME)
      .orderBy('timestamp', 'desc')
      .limit(MAX_WEBHOOKS)
      .get();

    const webhooks: Webhook[] = webhooksSnap.docs.map((doc) => {
      const data = doc.data() as Webhook;
      return { ...data, direction: data.direction || 'incoming' };
    });

    const data: WebhookHistory = {
      webhooks,
      maxSize: projectData.maxSize || MAX_WEBHOOKS,
    };

    return { data, etag };
  } catch (error) {
    console.error(`[Firestore] Error getting webhooks for ${slug}:`, error);
    return { data: null, etag: null };
  }
}

export async function appendWebhook(
  slug: string,
  webhook: Webhook,
): Promise<void> {
  const firestore = await getFirestore();
  const docRef = firestore.collection(COLLECTION).doc(slug);
  const webhooksRef = docRef.collection('webhooks');

  await firestore.runTransaction(async (tx) => {
    // All reads must happen before any writes
    const projectSnap = await tx.get(docRef);

    // Enforce cap: delete oldest beyond MAX_WEBHOOKS
    // Read this before any writes
    const extraQuery = webhooksRef
      .orderBy('timestamp', 'desc')
      .offset(MAX_WEBHOOKS)
      .limit(50);
    const extraSnap = await tx.get(extraQuery);

    // Now perform all writes
    if (!projectSnap.exists) {
      tx.set(docRef, {
        slug,
        createdAt: Date.now(),
        webhooksUpdatedAt: Date.now(),
        type: 'project',
        maxSize: MAX_WEBHOOKS,
      });
    }

    tx.set(webhooksRef.doc(webhook.id), webhook);

    for (const doc of extraSnap.docs) {
      tx.delete(doc.ref);
    }

    tx.set(
      docRef,
      {
        slug,
        lastWebhookTimestamp: webhook.timestamp,
        updatedAt: Date.now(),
        webhooksUpdatedAt: Date.now(),
        type: 'project',
        maxSize: MAX_WEBHOOKS,
      },
      { merge: true },
    );
  });
}

export async function saveWebhooks(
  slug: string,
  webhooks: Webhook[],
): Promise<string> {
  const firestore = await getFirestore();
  const docRef = await ensureProjectDoc(firestore, slug);
  const webhooksRef = docRef.collection('webhooks');
  const trimmed = webhooks.slice(0, MAX_WEBHOOKS);

  // Replace collection contents
  const batch = firestore.batch();

  const existing = await webhooksRef.get();
  for (const doc of existing.docs) {
    batch.delete(doc.ref);
  }

  trimmed.forEach((webhook) => {
    batch.set(webhooksRef.doc(webhook.id), webhook);
  });

  const now = Date.now();
  batch.set(
    docRef,
    {
      slug,
      webhookCount: trimmed.length,
      lastWebhookTimestamp: trimmed[0]?.timestamp || null,
      updatedAt: now,
      webhooksUpdatedAt: now,
      type: 'project',
      maxSize: MAX_WEBHOOKS,
    },
    { merge: true },
  );

  await batch.commit();
  return now.toString();
}

export async function clearWebhooks(slug: string): Promise<void> {
  const firestore = await getFirestore();
  const docRef = firestore.collection(COLLECTION).doc(slug);
  const webhooksRef = docRef.collection('webhooks');

  const snap = await webhooksRef.get();
  const batch = firestore.batch();
  for (const doc of snap.docs) {
    batch.delete(doc.ref);
  }

  const now = Date.now();
  batch.set(
    docRef,
    {
      webhookCount: 0,
      lastWebhookTimestamp: null,
      updatedAt: now,
      webhooksUpdatedAt: now,
    },
    { merge: true },
  );

  await batch.commit();
  await resetProjectStats(slug);
}
