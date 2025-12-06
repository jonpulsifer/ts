const SENSITIVE_HEADERS = [
  'x-vercel-oidc-token',
  'x-github-token',
  'x-gitlab-token',
  'x-bitbucket-token',
  'x-azure-devops-token',
  'x-aws-secret-key',
  'x-aws-access-key',
  'Authorization',
] as const;

const SENSITIVE_HEADER_PLACEHOLDER = '🤡';

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
    // Replace sensitive header values with a placeholder string
    if (
      SENSITIVE_HEADERS.includes(
        key.toLowerCase() as (typeof SENSITIVE_HEADERS)[number],
      )
    ) {
      sanitized[key] = SENSITIVE_HEADER_PLACEHOLDER.toLowerCase();
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
