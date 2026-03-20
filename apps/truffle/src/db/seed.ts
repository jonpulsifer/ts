import { sql } from 'bun';

async function run() {
  const [{ count }] = await sql<{ count: number }>`
    SELECT COUNT(*)::int AS count FROM projects
  `;

  if (count > 0) {
    console.log('seed skipped: data already present');
    return;
  }

  await sql.begin(async (tx) => {
    const [project] = await tx<{ id: number }>`
      INSERT INTO projects ${sql({
        name: 'Truffle Lab',
        slug: 'truffle-lab',
      })}
      RETURNING id
    `;

    const [deployment] = await tx<{ id: number }>`
      INSERT INTO deployments ${sql({
        project_id: project.id,
        version: '0.1.0',
        environment: 'staging',
        status: 'healthy',
      })}
      RETURNING id
    `;

    await tx`
      INSERT INTO checks ${sql({
        deployment_id: deployment.id,
        name: 'db-migration',
        status: 'pass',
        message: 'schema applied',
      })}
    `;
  });

  console.log('seeded initial data');
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('seed failed', error);
    process.exit(1);
  });
