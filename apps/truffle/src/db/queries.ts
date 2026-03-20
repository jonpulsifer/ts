import { sql } from 'bun';

export type Specimen = {
  id: number;
  name: string;
  species: string;
  status: string;
  sporeCount: number;
  humidity: number;
  notes: string | null;
  createdAt: string;
};

export type Transmission = {
  id: number;
  message: string;
  severity: string;
  createdAt: string;
};

export type Stats = {
  specimens: number;
  totalSpores: number;
  transmissions: number;
  decomposed: number;
};

const SPECIES = [
  'Aspergillus niger',
  'Penicillium chrysogenum',
  'Rhizopus stolonifer',
  'Mucor mucedo',
  'Trichoderma viride',
  'Cladosporium herbarum',
  'Fusarium oxysporum',
  'Neurospora crassa',
  'Alternaria alternata',
  'Botrytis cinerea',
  'Stachybotrys chartarum',
  'Agaricus bisporus',
  'Cordyceps militaris',
  'Trametes versicolor',
  'Ganoderma lucidum',
];

const ADJECTIVES = [
  'Fuzzy', 'Slimy', 'Crusty', 'Spotted', 'Glowing',
  'Pungent', 'Ethereal', 'Bubbling', 'Creeping', 'Luminous',
  'Whispering', 'Oozing', 'Crystalline', 'Writhing', 'Dormant',
  'Wretched', 'Ancient', 'Forbidden', 'Sentient', 'Volatile',
];

const NOUNS = [
  'Colony', 'Bloom', 'Patch', 'Culture', 'Cluster',
  'Growth', 'Mass', 'Formation', 'Specimen', 'Sample',
  'Tendril', 'Substrate', 'Mycelium', 'Sporeling', 'Fruiting Body',
];

const LIFECYCLE: string[] = [
  'dormant', 'germinating', 'thriving', 'sporulating', 'moldy', 'decomposed',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function generateName(): string {
  return `${randomFrom(ADJECTIVES)} ${randomFrom(NOUNS)} #${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;
}

export async function listSpecimens() {
  return sql<Specimen>`
    SELECT id, name, species, status,
           spore_count AS "sporeCount",
           humidity,
           notes,
           created_at AS "createdAt"
    FROM specimens
    ORDER BY created_at DESC
  `;
}

export async function inoculate(customName?: string) {
  const name = customName?.trim() || generateName();
  const species = randomFrom(SPECIES);
  const humidity = Math.round((50 + Math.random() * 45) * 10) / 10;

  const [specimen] = await sql<Specimen>`
    INSERT INTO specimens ${sql({
      name,
      species,
      status: 'dormant',
      spore_count: 0,
      humidity,
      notes: 'freshly inoculated',
    })}
    RETURNING id, name, species, status,
              spore_count AS "sporeCount",
              humidity, notes,
              created_at AS "createdAt"
  `;

  await logTransmission(`specimen inoculated: ${name} (${species})`, 'success');
  return specimen;
}

export async function contaminate() {
  const alive = await sql<Specimen>`
    SELECT id, name, species, status,
           spore_count AS "sporeCount",
           humidity, notes,
           created_at AS "createdAt"
    FROM specimens
    WHERE status != 'decomposed'
    ORDER BY RANDOM()
    LIMIT 1
  `;

  if (!alive.length) return null;

  const specimen = alive[0]!;
  const currentIdx = LIFECYCLE.indexOf(specimen.status);
  const nextStatus = LIFECYCLE[Math.min(currentIdx + 1, LIFECYCLE.length - 1)]!;
  const sporeGain = Math.floor(Math.random() * 200) + 10;
  const humidityShift = Math.round((Math.random() * 10 - 5) * 10) / 10;

  const messages: Record<string, string> = {
    germinating: `${specimen.name} shows signs of life... mycelium emerging`,
    thriving: `${specimen.name} is thriving! hyphal network expanding rapidly`,
    sporulating: `WARNING: ${specimen.name} entering sporulation phase. seal containment.`,
    moldy: `ALERT: ${specimen.name} has gone full mold. spore dispersal imminent.`,
    decomposed: `${specimen.name} has fully decomposed. rest in compost.`,
  };

  const [updated] = await sql<Specimen>`
    UPDATE specimens
    SET status = ${nextStatus},
        spore_count = spore_count + ${sporeGain},
        humidity = GREATEST(0, LEAST(100, humidity + ${humidityShift})),
        notes = ${messages[nextStatus] || 'status changed'}
    WHERE id = ${specimen.id}
    RETURNING id, name, species, status,
              spore_count AS "sporeCount",
              humidity, notes,
              created_at AS "createdAt"
  `;

  const severity =
    nextStatus === 'decomposed' ? 'error' :
    nextStatus === 'moldy' || nextStatus === 'sporulating' ? 'warn' :
    'info';

  await logTransmission(
    messages[nextStatus] || `${specimen.name} mutated to ${nextStatus}`,
    severity,
  );

  return updated;
}

export async function purgeDecomposed() {
  const result = await sql`
    DELETE FROM specimens WHERE status = 'decomposed'
    RETURNING id
  `;

  const count = result.length;
  if (count > 0) {
    await logTransmission(
      `purged ${count} decomposed specimen${count > 1 ? 's' : ''}. rest in compost.`,
      'warn',
    );
  } else {
    await logTransmission(
      'purge requested but no decomposed specimens found. the lab is clean... for now.',
      'info',
    );
  }

  return { purged: count };
}

export async function getStats(): Promise<Stats> {
  const [row] = await sql<Stats>`
    SELECT
      (SELECT COUNT(*)::int FROM specimens) AS specimens,
      (SELECT COALESCE(SUM(spore_count), 0)::int FROM specimens) AS "totalSpores",
      (SELECT COUNT(*)::int FROM transmissions) AS transmissions,
      (SELECT COUNT(*)::int FROM specimens WHERE status = 'decomposed') AS decomposed
  `;
  return row ?? { specimens: 0, totalSpores: 0, transmissions: 0, decomposed: 0 };
}

export async function listTransmissions(limit = 25) {
  return sql<Transmission>`
    SELECT id, message, severity, created_at AS "createdAt"
    FROM transmissions
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
}

export async function logTransmission(message: string, severity = 'info') {
  const [row] = await sql<Transmission>`
    INSERT INTO transmissions ${sql({ message, severity })}
    RETURNING id, message, severity, created_at AS "createdAt"
  `;
  return row;
}
