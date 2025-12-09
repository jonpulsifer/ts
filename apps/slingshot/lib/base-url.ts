// Minimal base URL helper for client-only use.
export const BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
