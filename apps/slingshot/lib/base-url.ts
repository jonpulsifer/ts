/**
 * Get the base URL for the application
 * Uses NEXT_PUBLIC_BASE_URL environment variable or falls back to localhost
 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
