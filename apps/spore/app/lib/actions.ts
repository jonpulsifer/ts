import { createWriteStream } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { desc, eq } from 'drizzle-orm';
import { db } from '~/db';
import {
  hosts,
  isos,
  type NewHost,
  type NewIso,
  type NewProfile,
  profiles,
} from '~/db/schema';

function getIsoStorageDir() {
  return (
    process.env.ISO_STORAGE_DIR || path.join(process.cwd(), 'storage', 'isos')
  );
}

function safeFileName(name: string) {
  return name
    .replaceAll('\\', '_')
    .replaceAll('/', '_')
    .replaceAll(':', '_')
    .trim()
    .slice(0, 128);
}

// Hosts
export async function getHosts() {
  return await db.select().from(hosts).orderBy(desc(hosts.lastSeen));
}

export async function getHost(macAddress: string) {
  return await db
    .select()
    .from(hosts)
    .where(eq(hosts.macAddress, macAddress))
    .get();
}

export async function updateHost(macAddress: string, data: Partial<NewHost>) {
  await db
    .update(hosts)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(hosts.macAddress, macAddress));
}

export async function deleteHost(macAddress: string) {
  await db.delete(hosts).where(eq(hosts.macAddress, macAddress));
}

export async function createHost(data: NewHost) {
  const now = new Date().toISOString();
  await db.insert(hosts).values({
    ...data,
    macAddress: data.macAddress.toLowerCase().replace(/-/g, ':'),
    createdAt: now,
    updatedAt: now,
  });
}

// Profiles
export async function getProfiles() {
  return await db.select().from(profiles).orderBy(desc(profiles.updatedAt));
}

export async function getProfile(id: number) {
  return await db.select().from(profiles).where(eq(profiles.id, id)).get();
}

export async function createProfile(data: NewProfile) {
  await db.insert(profiles).values(data);
}

export async function updateProfile(id: number, data: Partial<NewProfile>) {
  await db
    .update(profiles)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(profiles.id, id));
}

export async function deleteProfile(id: number) {
  await db.delete(profiles).where(eq(profiles.id, id));
}

// ISOs
export async function getIsos() {
  return await db.select().from(isos).orderBy(desc(isos.updatedAt));
}

export async function getIso(id: number) {
  return await db.select().from(isos).where(eq(isos.id, id)).get();
}

export async function createIso(data: Pick<NewIso, 'name' | 'url'>) {
  const now = new Date().toISOString();
  await db.insert(isos).values({
    name: data.name,
    url: data.url,
    source: 'url',
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateIsoMeta(id: number, data: Pick<NewIso, 'name'>) {
  const now = new Date().toISOString();
  await db
    .update(isos)
    .set({ name: data.name, updatedAt: now })
    .where(eq(isos.id, id));
}

export async function updateIsoUrl(
  id: number,
  data: Pick<NewIso, 'name' | 'url'>,
) {
  const existing = await getIso(id);
  if (!existing) throw new Error('ISO not found');

  if (existing.source === 'upload') {
    const storageDir = getIsoStorageDir();
    await rm(path.join(storageDir, String(id)), {
      recursive: true,
      force: true,
    });
  }

  const now = new Date().toISOString();
  await db
    .update(isos)
    .set({
      name: data.name,
      url: data.url,
      source: 'url',
      filePath: null,
      fileName: null,
      contentType: null,
      sizeBytes: null,
      updatedAt: now,
    })
    .where(eq(isos.id, id));
}

export async function createIsoUpload(formData: FormData) {
  const name = (formData.get('name') || '').toString();
  const file = formData.get('file');

  if (!name.trim()) {
    throw new Error('Name is required');
  }
  if (!(file instanceof File)) {
    throw new Error('File is required');
  }

  const now = new Date().toISOString();

  const inserted = await db
    .insert(isos)
    .values({
      name,
      url: '',
      source: 'upload',
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: isos.id })
    .get();

  if (!inserted?.id) {
    throw new Error('Failed to create ISO record');
  }

  const storageDir = getIsoStorageDir();
  const isoDir = path.join(storageDir, String(inserted.id));
  await mkdir(isoDir, { recursive: true });

  const fileName =
    safeFileName(file.name || `iso-${inserted.id}.iso`) ||
    `iso-${inserted.id}.iso`;
  const relPath = path.join(String(inserted.id), fileName);
  const fullPath = path.join(storageDir, relPath);

  await pipeline(
    Readable.fromWeb(
      file.stream() as unknown as import('stream/web').ReadableStream,
    ),
    createWriteStream(fullPath),
  );

  await db
    .update(isos)
    .set({
      url: `{{SPORE_ORIGIN}}/api/isos/${inserted.id}/file`,
      source: 'upload',
      filePath: relPath,
      fileName,
      contentType: file.type || null,
      sizeBytes: file.size || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(isos.id, inserted.id));

  return inserted.id;
}

export async function updateIsoUpload(id: number, formData: FormData) {
  const name = (formData.get('name') || '').toString();
  const file = formData.get('file');

  if (!name.trim()) {
    throw new Error('Name is required');
  }
  if (!(file instanceof File)) {
    throw new Error('File is required');
  }

  const existing = await getIso(id);
  if (!existing) throw new Error('ISO not found');

  const storageDir = getIsoStorageDir();
  const isoDir = path.join(storageDir, String(id));
  await mkdir(isoDir, { recursive: true });

  // Remove old uploaded file directory content (simple + robust)
  await rm(isoDir, { recursive: true, force: true });
  await mkdir(isoDir, { recursive: true });

  const fileName =
    safeFileName(file.name || `iso-${id}.iso`) || `iso-${id}.iso`;
  const relPath = path.join(String(id), fileName);
  const fullPath = path.join(storageDir, relPath);

  await pipeline(
    Readable.fromWeb(
      file.stream() as unknown as import('stream/web').ReadableStream,
    ),
    createWriteStream(fullPath),
  );

  await db
    .update(isos)
    .set({
      name,
      url: `{{SPORE_ORIGIN}}/api/isos/${id}/file`,
      source: 'upload',
      filePath: relPath,
      fileName,
      contentType: file.type || null,
      sizeBytes: file.size || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(isos.id, id));
}

export async function deleteIso(id: number) {
  // Ensure we don't leave profiles pointing at a deleted ISO.
  await db.update(profiles).set({ isoId: null }).where(eq(profiles.isoId, id));

  const iso = await getIso(id);
  if (iso?.source === 'upload') {
    const storageDir = getIsoStorageDir();
    await rm(path.join(storageDir, String(id)), {
      recursive: true,
      force: true,
    });
  }

  await db.delete(isos).where(eq(isos.id, id));
}
