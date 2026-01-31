import type { Host, Profile } from './db/schema';

export interface TemplateContext {
  mac: string;
  macHyphen: string;
  hostname: string;
  profileName: string;
  serverIp: string;
  baseUrl: string;
}

/**
 * Normalize a MAC address to lowercase colon-separated format
 * Accepts: aa:bb:cc:dd:ee:ff, AA:BB:CC:DD:EE:FF, aa-bb-cc-dd-ee-ff, aabbccddeeff
 */
export function normalizeMac(mac: string): string {
  // Remove all separators and convert to lowercase
  const clean = mac.toLowerCase().replace(/[:-]/g, '');

  // Validate length
  if (clean.length !== 12 || !/^[0-9a-f]+$/.test(clean)) {
    throw new Error(`Invalid MAC address: ${mac}`);
  }

  // Format as colon-separated
  return clean.match(/.{2}/g)!.join(':');
}

/**
 * Convert colon-separated MAC to hyphen-separated
 */
export function macToHyphen(mac: string): string {
  return mac.replace(/:/g, '-');
}

/**
 * Build template context from host and profile data
 */
export function buildTemplateContext(
  mac: string,
  host: Host | null,
  profile: Profile | null,
  serverOrigin: string,
): TemplateContext {
  const normalizedMac = normalizeMac(mac);

  // Extract server IP from origin (e.g., "http://10.2.0.11:3000" -> "10.2.0.11")
  let serverIp = 'localhost';
  try {
    const url = new URL(serverOrigin);
    serverIp = url.hostname;
  } catch {
    // Keep default
  }

  return {
    mac: normalizedMac,
    macHyphen: macToHyphen(normalizedMac),
    hostname: host?.hostname || 'unknown',
    profileName: profile?.name || 'default',
    serverIp,
    baseUrl: serverOrigin,
  };
}

/**
 * Process template variables in an iPXE script
 * Supports: {{mac}}, {{mac_hyphen}}, {{hostname}}, {{profile_name}}, {{server_ip}}, {{base_url}}
 */
export function processTemplate(
  content: string,
  context: TemplateContext,
): string {
  return content
    .replace(/\{\{mac\}\}/gi, context.mac)
    .replace(/\{\{mac_hyphen\}\}/gi, context.macHyphen)
    .replace(/\{\{hostname\}\}/gi, context.hostname)
    .replace(/\{\{profile_name\}\}/gi, context.profileName)
    .replace(/\{\{server_ip\}\}/gi, context.serverIp)
    .replace(/\{\{base_url\}\}/gi, context.baseUrl);
}

/**
 * Generate a "boot to local disk" fallback script
 */
export function localBootScript(mac: string): string {
  return `#!ipxe
# Spore: No profile assigned
echo Host ${mac} is not configured for network boot
echo Booting to local disk...
sleep 3
exit
`;
}

/**
 * Generate a "host not registered" script
 */
export function unregisteredHostScript(mac: string): string {
  return `#!ipxe
# Spore: Unknown host
echo Unknown host: ${mac}
echo Auto-registration is disabled
echo Booting to local disk...
sleep 3
exit
`;
}
