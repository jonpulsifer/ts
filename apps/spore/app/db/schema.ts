import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const isos = sqliteTable('isos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  // "url" is the bootable URL used by iPXE. For uploaded ISOs this will be
  // a server-local route (e.g. {{SPORE_ORIGIN}}/api/isos/:id/file).
  source: text('source').notNull().default('url'), // 'url' | 'upload'
  filePath: text('file_path'), // relative to ISO_STORAGE_DIR
  fileName: text('file_name'),
  contentType: text('content_type'),
  sizeBytes: integer('size_bytes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const profiles = sqliteTable('profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  content: text('content').notNull(), // The iPXE script content
  variables: text('variables'), // JSON object for template variables
  isoId: integer('iso_id').references(() => isos.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const hosts = sqliteTable('hosts', {
  macAddress: text('mac_address').primaryKey(), // MAC address as primary key
  hostname: text('hostname'),
  profileId: integer('profile_id').references(() => profiles.id),
  variables: text('variables'), // JSON object for host-specific template variables
  lastSeen: text('last_seen'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Host = typeof hosts.$inferSelect;
export type NewHost = typeof hosts.$inferInsert;

export type Iso = typeof isos.$inferSelect;
export type NewIso = typeof isos.$inferInsert;
