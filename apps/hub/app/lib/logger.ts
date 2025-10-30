/**
 * Simple logging wrapper using native console methods.
 * Works in both development and production.
 */

/**
 * Log debug information
 */
export function log(...args: unknown[]): void {
  console.debug(...args);
}

/**
 * Log informational messages
 */
export function logInfo(...args: unknown[]): void {
  console.info(...args);
}

/**
 * Log warnings
 */
export function logWarn(...args: unknown[]): void {
  console.warn(...args);
}

/**
 * Log errors (always logged, bubbles up errors properly)
 */
export function logError(...args: unknown[]): void {
  console.error(...args);
}
