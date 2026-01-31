import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { db, scripts, settings } from '@/lib/db';
import { buildTemplateContext, processTemplate } from '@/lib/ipxe';

export const dynamic = 'force-dynamic';

async function getSetting(key: string): Promise<string | null> {
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .get();
  return result?.value ?? null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: pathSegments } = await params;
  const scriptPath = pathSegments.join('/');

  // Look up the script
  const script = await db
    .select()
    .from(scripts)
    .where(eq(scripts.path, scriptPath))
    .get();

  if (!script) {
    return new Response(
      `#!ipxe\necho Script not found: ${scriptPath}\nsleep 3\nexit\n`,
      {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      },
    );
  }

  // Get server origin for template variables
  const configuredOrigin = await getSetting('serverOrigin');
  const serverOrigin =
    configuredOrigin ||
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const baseUrl = configuredOrigin || `${protocol}://${serverOrigin}`;

  // Try to get MAC from query params (optional, for template context)
  const mac = request.nextUrl.searchParams.get('mac') || '00:00:00:00:00:00';

  // Build a minimal template context (host-specific vars will be generic)
  const context = buildTemplateContext(mac, null, null, baseUrl);
  const content = processTemplate(script.content, context);

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
