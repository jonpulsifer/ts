import { sql } from 'bun';

async function run() {
  const [{ count }] = await sql<{ count: number }>`
    SELECT COUNT(*)::int AS count FROM specimens
  `;

  if (count > 0) {
    console.log('seed skipped: specimens already in containment');
    return;
  }

  await sql.begin(async (tx) => {
    await tx`INSERT INTO specimens ${sql([
      {
        name: 'Fuzzy Colony #001',
        species: 'Penicillium chrysogenum',
        status: 'thriving',
        spore_count: 347,
        humidity: 72.3,
        notes: 'the OG. been here since day one.',
      },
      {
        name: 'Glowing Mass #042',
        species: 'Neurospora crassa',
        status: 'sporulating',
        spore_count: 891,
        humidity: 88.1,
        notes: 'WARNING: bioluminescent activity detected',
      },
      {
        name: 'Creeping Patch #007',
        species: 'Rhizopus stolonifer',
        status: 'moldy',
        spore_count: 1203,
        humidity: 95.0,
        notes: 'containment breach in sector 7. again.',
      },
      {
        name: 'Dormant Sporeling #099',
        species: 'Cordyceps militaris',
        status: 'dormant',
        spore_count: 0,
        humidity: 55.2,
        notes: 'freshly inoculated. we wait.',
      },
    ])}`;

    await tx`INSERT INTO transmissions ${sql([
      { message: 'SYSTEM BOOT: truffle mold lab v2.0 online', severity: 'success' },
      { message: 'loaded 4 legacy specimens from cold storage', severity: 'info' },
      { message: 'humidity sensors calibrated across all sectors', severity: 'info' },
      { message: 'WARNING: specimen #007 containment integrity at 23%', severity: 'warn' },
      { message: 'spore filtration systems nominal', severity: 'info' },
      { message: 'mycelium network bandwidth: 420 spores/sec', severity: 'success' },
    ])}`;
  });

  console.log('seeded mold lab with initial specimens and transmissions');
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('seed failed:', error);
    process.exit(1);
  });
