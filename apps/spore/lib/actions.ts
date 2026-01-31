'use server';

import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, hosts, profiles, scripts, settings } from './db';
import type { NewHost, NewProfile, NewScript } from './db/schema';
import { normalizeMac } from './ipxe';

// ============================================================================
// Hosts
// ============================================================================

export async function getHosts() {
  return db.select().from(hosts).orderBy(desc(hosts.lastSeen));
}

export async function getHost(macAddress: string) {
  const normalized = normalizeMac(macAddress);
  return db.select().from(hosts).where(eq(hosts.macAddress, normalized)).get();
}

export async function createHost(data: {
  macAddress: string;
  hostname?: string;
  profileId?: number;
}) {
  const now = new Date().toISOString();
  const normalized = normalizeMac(data.macAddress);

  await db.insert(hosts).values({
    macAddress: normalized,
    hostname: data.hostname || null,
    profileId: data.profileId || null,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath('/hosts');
  revalidatePath('/');
}

export async function updateHost(
  macAddress: string,
  data: Partial<Pick<NewHost, 'hostname' | 'profileId'>>,
) {
  const normalized = normalizeMac(macAddress);
  const now = new Date().toISOString();

  await db
    .update(hosts)
    .set({ ...data, updatedAt: now })
    .where(eq(hosts.macAddress, normalized));

  revalidatePath('/hosts');
  revalidatePath(`/hosts/${encodeURIComponent(macAddress)}`);
  revalidatePath('/');
}

export async function deleteHost(macAddress: string) {
  const normalized = normalizeMac(macAddress);
  await db.delete(hosts).where(eq(hosts.macAddress, normalized));

  revalidatePath('/hosts');
  revalidatePath('/');
}

// ============================================================================
// Profiles
// ============================================================================

export async function getProfiles() {
  return db.select().from(profiles).orderBy(desc(profiles.updatedAt));
}

export async function getProfile(id: number) {
  return db.select().from(profiles).where(eq(profiles.id, id)).get();
}

export async function createProfile(
  data: Pick<NewProfile, 'name' | 'description' | 'content' | 'isDefault'>,
) {
  const now = new Date().toISOString();

  // If this profile is set as default, unset any existing default
  if (data.isDefault) {
    await db.update(profiles).set({ isDefault: false });
  }

  const result = await db
    .insert(profiles)
    .values({
      name: data.name,
      description: data.description || null,
      content: data.content,
      isDefault: data.isDefault || false,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: profiles.id });

  revalidatePath('/profiles');
  revalidatePath('/');

  return result[0];
}

export async function updateProfile(
  id: number,
  data: Partial<
    Pick<NewProfile, 'name' | 'description' | 'content' | 'isDefault'>
  >,
) {
  const now = new Date().toISOString();

  // If this profile is being set as default, unset any existing default
  if (data.isDefault) {
    await db.update(profiles).set({ isDefault: false });
  }

  await db
    .update(profiles)
    .set({ ...data, updatedAt: now })
    .where(eq(profiles.id, id));

  revalidatePath('/profiles');
  revalidatePath(`/profiles/${id}`);
  revalidatePath('/');
}

export async function deleteProfile(id: number) {
  // Clear profile assignments from hosts
  await db
    .update(hosts)
    .set({ profileId: null })
    .where(eq(hosts.profileId, id));

  await db.delete(profiles).where(eq(profiles.id, id));

  revalidatePath('/profiles');
  revalidatePath('/hosts');
  revalidatePath('/');
}

// ============================================================================
// Scripts
// ============================================================================

export async function getScripts() {
  return db.select().from(scripts).orderBy(scripts.path);
}

export async function getScript(id: number) {
  return db.select().from(scripts).where(eq(scripts.id, id)).get();
}

export async function getScriptByPath(path: string) {
  return db.select().from(scripts).where(eq(scripts.path, path)).get();
}

export async function createScript(
  data: Pick<NewScript, 'path' | 'description' | 'content'>,
) {
  const now = new Date().toISOString();

  const result = await db
    .insert(scripts)
    .values({
      path: data.path,
      description: data.description || null,
      content: data.content,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: scripts.id });

  revalidatePath('/scripts');
  revalidatePath('/');

  return result[0];
}

export async function updateScript(
  id: number,
  data: Partial<Pick<NewScript, 'path' | 'description' | 'content'>>,
) {
  const now = new Date().toISOString();

  await db
    .update(scripts)
    .set({ ...data, updatedAt: now })
    .where(eq(scripts.id, id));

  revalidatePath('/scripts');
  revalidatePath('/');
}

export async function deleteScript(id: number) {
  await db.delete(scripts).where(eq(scripts.id, id));

  revalidatePath('/scripts');
  revalidatePath('/');
}

// ============================================================================
// Settings
// ============================================================================

export async function getSettings() {
  const rows = await db.select().from(settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getSetting(key: string) {
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .get();
  return result?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });

  revalidatePath('/settings');
  revalidatePath('/');
}

export async function deleteSetting(key: string) {
  await db.delete(settings).where(eq(settings.key, key));
  revalidatePath('/settings');
}
