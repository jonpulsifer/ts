import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Hosts - identified by MAC address
export const hosts = sqliteTable('hosts', {
  macAddress: text('mac_address').primaryKey(), // normalized to lowercase colon-separated
  hostname: text('hostname'),
  profileId: integer('profile_id').references(() => profiles.id, {
    onDelete: 'set null',
  }),
  lastSeen: text('last_seen'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Boot Profiles - top-level boot configurations assigned to hosts
export const profiles = sqliteTable('profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  content: text('content').notNull(), // iPXE script content
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Scripts - chainable sub-scripts with hierarchical paths
export const scripts = sqliteTable('scripts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').notNull().unique(), // e.g., "k8s-node/netboot.ipxe"
  description: text('description'),
  content: text('content').notNull(), // iPXE script content
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Settings - key/value app configuration
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

// Type exports
export type Host = typeof hosts.$inferSelect;
export type NewHost = typeof hosts.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Script = typeof scripts.$inferSelect;
export type NewScript = typeof scripts.$inferInsert;

export type Setting = typeof settings.$inferSelect;
