import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const sqlite = new Database(
  process.env.DATABASE_URL?.replace('file:', '') || 'spore.db',
);

// Enable WAL mode for better concurrent access
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Re-export schema for convenience
export * from './schema';
