/**
 * Validates if an outgoing webhook URL is allowed based on environment configuration.
 * In production, only domains listed in WEBHOOK_ALLOWED_OUTGOING_DOMAINS are allowed.
 * In development, all domains are allowed.
 */
export function validateOutgoingDomain(url: string): {
  allowed: boolean;
  error?: string;
} {
  // In development, allow all domains
  if (process.env.NODE_ENV !== 'production') {
    return { allowed: true };
  }

  // In production, check against allowed domains
  const allowedDomains = process.env.WEBHOOK_ALLOWED_OUTGOING_DOMAINS;

  // If no restriction is set in production, deny all
  if (!allowedDomains) {
    return { allowed: false };
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Parse allowed domains (comma-separated, trim whitespace)
    const allowedList = allowedDomains
      .split(',')
      .map((domain) => domain.trim().toLowerCase())
      .filter((domain) => domain.length > 0);

    // Check if hostname matches any allowed domain
    // Supports exact match and subdomain matching (e.g., *.example.com)
    const isAllowed = allowedList.some((allowedDomain) => {
      // Exact match
      if (hostname === allowedDomain) {
        return true;
      }

      // Wildcard subdomain match (e.g., *.example.com)
      if (allowedDomain.startsWith('*.')) {
        const baseDomain = allowedDomain.slice(2); // Remove '*.'
        return hostname === baseDomain || hostname.endsWith(`.${baseDomain}`);
      }

      return false;
    });

    if (!isAllowed) {
      return {
        allowed: false,
        error: `Domain ${hostname} is not in the allowed list. Allowed domains: ${allowedDomains}`,
      };
    }

    return { allowed: true };
  } catch (error) {
    return {
      allowed: false,
      error: `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
