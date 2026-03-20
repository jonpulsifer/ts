import { sql } from 'bun';

const migrationGlob = new Bun.Glob('src/db/migrations/*.sql');

async function ensureMigrationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

async function listMigrations() {
  const files: string[] = [];
  for await (const file of migrationGlob.scan('.')) {
    files.push(file);
  }
  files.sort();
  return files;
}

async function listApplied() {
  const rows = await sql<{ id: string }>`
    SELECT id
    FROM schema_migrations
    ORDER BY id
  `;
  return new Set(rows.map((row) => row.id));
}

async function run() {
  await ensureMigrationsTable();

  const [migrations, applied] = await Promise.all([
    listMigrations(),
    listApplied(),
  ]);

  for (const file of migrations) {
    const id = file.split('/').pop() ?? file;
    if (applied.has(id)) {
      continue;
    }

    await sql.file(file);
    await sql`
      INSERT INTO schema_migrations (id)
      VALUES (${id})
    `;
    console.log(`applied ${id}`);
  }
}

run().catch((error) => {
  console.error('migration failed', error);
  process.exitCode = 1;
});
