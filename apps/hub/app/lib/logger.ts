/**
 * Simple logging wrapper using native console methods.
 * Works in both development and production.
 */

class Logger {
  /**
   * Log debug information
   */
  debug(...args: unknown[]): void {
    console.debug(...args);
  }

  /**
   * Log informational messages
   */
  info(...args: unknown[]): void {
    console.info(...args);
  }

  /**
   * Log warnings
   */
  warn(...args: unknown[]): void {
    console.warn(...args);
  }

  /**
   * Log errors (always logged, bubbles up errors properly)
   */
  error(...args: unknown[]): void {
    console.error(...args);
  }

  /**
   * Alias for debug (for backward compatibility)
   */
  log(...args: unknown[]): void {
    this.debug(...args);
  }
}

// Export singleton instance
export const log = new Logger();

// Export class for testing or custom instances if needed
export { Logger };
