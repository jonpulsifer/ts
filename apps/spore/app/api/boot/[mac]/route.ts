import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { db, hosts, profiles, settings } from '@/lib/db';
import {
  buildTemplateContext,
  localBootScript,
  normalizeMac,
  processTemplate,
  unregisteredHostScript,
} from '@/lib/ipxe';


async function getSetting(key: string): Promise<string | null> {
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .get();
  return result?.value ?? null;
}

async function getDefaultProfile() {
  return db.select().from(profiles).where(eq(profiles.isDefault, true)).get();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mac: string }> },
) {
  const { mac: rawMac } = await params;

  // Normalize MAC address
  let mac: string;
  try {
    mac = normalizeMac(rawMac);
  } catch {
    return new Response(`#!ipxe\necho Invalid MAC address: ${rawMac}\nexit\n`, {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Parallelize independent data fetches
  const [configuredOrigin, initialHost] = await Promise.all([
    getSetting('serverOrigin'),
    db.select().from(hosts).where(eq(hosts.macAddress, mac)).get(),
  ]);

  let host = initialHost;

  const serverOrigin =
    configuredOrigin ||
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const baseUrl = configuredOrigin || `${protocol}://${serverOrigin}`;

  const now = new Date().toISOString();

  // Host not found - check auto-registration setting
  if (!host) {
    const autoRegister = (await getSetting('autoRegisterHosts')) !== 'false'; // default true

    if (!autoRegister) {
      return new Response(unregisteredHostScript(mac), {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Auto-register the host
    await db.insert(hosts).values({
      macAddress: mac,
      lastSeen: now,
      createdAt: now,
      updatedAt: now,
    });

    host = await db.select().from(hosts).where(eq(hosts.macAddress, mac)).get();
  } else {
    // Update lastSeen
    await db
      .update(hosts)
      .set({ lastSeen: now, updatedAt: now })
      .where(eq(hosts.macAddress, mac));
  }

  // Get the profile for this host
  let profile = host?.profileId
    ? await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, host.profileId))
        .get()
    : null;

  // If no profile assigned, use default profile
  if (!profile) {
    profile = await getDefaultProfile();
  }

  // If still no profile, boot to local disk
  if (!profile) {
    return new Response(localBootScript(mac), {
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Build template context and process the script
  const context = buildTemplateContext(mac, host!, profile, baseUrl);
  const script = processTemplate(profile.content, context);

  return new Response(script, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
