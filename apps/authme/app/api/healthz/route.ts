import { NextResponse } from 'next/server';
import { writeEncodedCertsFromEnv } from '../../../lib/certs';
import { prisma } from '../../../lib/prisma';

type PrismaRawResults = {
  count?: number;
  max_connections?: number;
}[];

writeEncodedCertsFromEnv();

export async function GET(): Promise<NextResponse> {
  // Execute the database queries
  const currentConnectionsResult: PrismaRawResults =
    await prisma.$queryRaw`SELECT COUNT(1) FROM pg_stat_activity;`;
  const maxConnectionsResult: PrismaRawResults =
    await prisma.$queryRaw`SHOW max_connections;`;

  // Extract and type assert the results
  const currentConnections = String(currentConnectionsResult[0]?.count) || '0';
  const maxConnections = String(maxConnectionsResult[0]?.max_connections) || '0';

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
