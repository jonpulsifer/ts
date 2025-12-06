import { customAlphabet } from 'nanoid';

/**
 * Custom NanoID alphabet: 64 characters (Base64-like)
 * Excludes ambiguous characters for better UX
 * Alphabet: 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz
 */
const alphabet =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

/**
 * Generate a 12-character NanoID
 * Entropy: 64^12 ≈ 3.2 × 10^21 combinations
 */
export const generateProjectId = customAlphabet(alphabet, 12);
