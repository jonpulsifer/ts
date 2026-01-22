import { eq } from 'drizzle-orm';
import { db } from '~/db';
import { hosts, profiles } from '~/db/schema';
import { buildBootContext, renderTemplate } from '~/lib/templating';
import type { Route } from './+types/api.boot.$mac';

/**
 * Generates an iPXE menu script with all available profiles.
 */
function generateMenuScript(
  origin: string,
  macAddress: string,
  allProfiles: Array<{ id: number; name: string }>,
  hostInfo?: { hostname?: string | null } | null,
): string {
  const hostname = hostInfo?.hostname || 'Unknown';

  let script = `#!ipxe
# Spore iPXE Boot Manager - Dynamic Menu
# MAC: ${macAddress}
# Hostname: ${hostname}

:start
menu Spore Boot Menu - ${hostname} (${macAddress})
`;

  // Add menu items for each profile
  for (const profile of allProfiles) {
    script += `item --key ${profile.id} profile_${profile.id} ${profile.name}\n`;
  }

  script += `item --gap --
item shell Drop to iPXE shell
item reboot Reboot
item exit Exit iPXE
choose --default shell --timeout 0 selected && goto \${selected} || goto shell

`;

  // Add goto targets for each profile
  for (const profile of allProfiles) {
    script += `:profile_${profile.id}
chain ${origin}/api/profiles/${profile.id}/boot?mac=${encodeURIComponent(macAddress)} || goto failed

`;
  }

  script += `:shell
echo Dropping to iPXE shell...
shell

:reboot
reboot

:exit
exit

:failed
echo Boot failed. Press any key to return to menu.
prompt
goto start
`;

  return script;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const macAddress = params.mac?.toLowerCase().replace(/-/g, ':');

  if (!macAddress) {
    return new Response('#!ipxe\necho No MAC address provided\nshell\n', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;

  // Find host record
  let hostRecord = await db
    .select()
    .from(hosts)
    .where(eq(hosts.macAddress, macAddress))
    .get();

  const now = new Date().toISOString();

  if (hostRecord) {
    // Update last seen
    await db
      .update(hosts)
      .set({ lastSeen: now })
      .where(eq(hosts.macAddress, macAddress));
  }

  // If host exists and has a profile assigned, boot directly into that profile
  if (hostRecord?.profileId) {
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, hostRecord.profileId))
      .get();

    if (profile) {
      // Direct boot: render the profile's iPXE script with host context
      const context = buildBootContext(origin, hostRecord, profile);
      const rendered = renderTemplate(profile.content, context);
      return new Response(rendered, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }

  // Host not found or no profile assigned: show the menu
  // Auto-register unknown hosts
  if (!hostRecord) {
    await db.insert(hosts).values({
      macAddress,
      lastSeen: now,
      createdAt: now,
      updatedAt: now,
    });
    hostRecord = await db
      .select()
      .from(hosts)
      .where(eq(hosts.macAddress, macAddress))
      .get();
  }

  // Get all available profiles for the menu
  const allProfiles = await db.select().from(profiles);

  if (allProfiles.length === 0) {
    // No profiles configured yet
    return new Response(
      `#!ipxe
echo ============================================
echo  Spore iPXE Boot Manager
echo  MAC: ${macAddress}
echo ============================================
echo.
echo No boot profiles have been configured yet.
echo Please add profiles in the Spore web interface.
echo.
echo Dropping to iPXE shell...
shell
`,
      {
        headers: { 'Content-Type': 'text/plain' },
      },
    );
  }

  // Generate and return the menu script
  const menuScript = generateMenuScript(
    origin,
    macAddress,
    allProfiles,
    hostRecord,
  );

  return new Response(menuScript, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
