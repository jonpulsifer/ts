import { eq } from 'drizzle-orm';
import { db } from '~/db';
import { hosts, profiles } from '~/db/schema';
import { buildBootContext, renderTemplate } from '~/lib/templating';
import type { Route } from './+types/api.profiles.$id.boot';

export async function loader({ params, request }: Route.LoaderArgs) {
  const profileId = Number(params.id);

  if (!profileId || Number.isNaN(profileId)) {
    return new Response('#!ipxe\necho Invalid profile ID\nshell\n', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .get();

  if (!profile) {
    return new Response('#!ipxe\necho Profile not found\nshell\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;
  const macAddress = url.searchParams
    .get('mac')
    ?.toLowerCase()
    .replace(/-/g, ':');

  // Try to load host-specific variables if a MAC is provided
  let hostRecord = null;
  if (macAddress) {
    hostRecord = await db
      .select()
      .from(hosts)
      .where(eq(hosts.macAddress, macAddress))
      .get();

    // Update last seen for the host
    if (hostRecord) {
      await db
        .update(hosts)
        .set({ lastSeen: new Date().toISOString() })
        .where(eq(hosts.macAddress, macAddress));
    }
  }

  // Build context with host info if available
  const context = buildBootContext(
    origin,
    hostRecord || {
      macAddress: macAddress || 'unknown',
      hostname: null,
      variables: null,
    },
    profile,
  );

  const rendered = renderTemplate(profile.content, context);

  return new Response(rendered, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
