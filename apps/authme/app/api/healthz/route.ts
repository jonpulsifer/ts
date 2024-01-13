import { writeEncodedCertsFromEnv } from 'lib/certs';
import { prisma } from 'lib/prisma';
import { NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaRawResults = any[];
writeEncodedCertsFromEnv();

export async function GET() {
  // Execute the database queries
  const currentConnectionsResult: PrismaRawResults =
    await prisma.$queryRaw`SELECT COUNT(1) FROM pg_stat_activity;`;
  const maxConnectionsResult: PrismaRawResults =
    await prisma.$queryRaw`SHOW max_connections;`;

  // Extract and type assert the results
  const currentConnections = currentConnectionsResult[0]?.count || '0';
  const maxConnections = maxConnectionsResult[0]?.max_connections || '0';

  return NextResponse.json(
    {
      status: 'ok',
      rev: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
      connections: {
        current: String(currentConnections),
        max: String(maxConnections),
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
