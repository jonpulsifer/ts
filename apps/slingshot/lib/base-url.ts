/**
 * Get the base URL for the application
 * Uses the current domain from request headers, or falls back to BASE_URL env var
 * @param headers Optional headers from Next.js headers() function
 */
export async function getBaseUrl(
  headers?: Awaited<ReturnType<typeof import('next/headers').headers>>,
): Promise<string> {
  // If headers are provided, try to extract the current domain
  if (headers) {
    const host = headers.get('host') || headers.get('x-forwarded-host');

    if (host) {
      // Determine protocol from headers
      let protocol = headers.get('x-forwarded-proto');
      if (!protocol) {
        // Check for SSL indicator
        if (headers.get('x-forwarded-ssl') === 'on') {
          protocol = 'https';
        } else {
          // Default to https if not localhost (production assumption)
          protocol =
            host.includes('localhost') || host.includes('127.0.0.1')
              ? 'http'
              : 'https';
        }
      }

      // Remove port if it's the default port (80 for http, 443 for https)
      const cleanHost = host.replace(/:(80|443)$/, '');
      return `${protocol}://${cleanHost}`;
    }
  }

  // Fall back to BASE_URL env var (should be slingshot.lolwtf.ca in production)
  // or NEXT_PUBLIC_BASE_URL for client-side
  return (
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://slingshot.lolwtf.ca'
  );
}

/**
 * Synchronous version for client-side use
 * Uses window.location.origin when available, otherwise falls back to env vars
 */
export const BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.BASE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'https://slingshot.lolwtf.ca';
