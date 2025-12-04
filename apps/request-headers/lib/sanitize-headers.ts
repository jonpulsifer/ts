/**
 * Sanitizes headers by replacing sensitive header values with a placeholder
 * @param headers - Record of header key-value pairs
 * @returns Sanitized headers with sensitive values replaced
 */
export function sanitizeHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    // Replace x-vercel-oidc-token value with clown emoji for security
    if (key.toLowerCase() === 'x-vercel-oidc-token') {
      sanitized[key] = '🤡';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
