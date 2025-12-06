import { z } from 'zod';

/**
 * Slug validation schema
 * - 1-32 characters
 * - Lowercase letters, numbers, and hyphens only
 * - Cannot start or end with a dash
 * - Dashes allowed in the middle
 */
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(32, 'Slug must be 32 characters or less')
  .regex(
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
    'Slug must contain only lowercase letters, numbers, and hyphens. Cannot start or end with a dash.',
  )
  .refine((val) => !val.startsWith('-'), {
    message: 'Slug cannot start with a dash',
  })
  .refine((val) => !val.endsWith('-'), {
    message: 'Slug cannot end with a dash',
  });
