import { writeEncodedCertsFromEnv } from 'lib/certs';
import { prisma } from 'lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  writeEncodedCertsFromEnv();
  const dbVersion = await prisma.$queryRaw`SELECT version();`;
  return NextResponse.json(
    {
      status: 'ok',
      dbVersion: dbVersion,
      rev: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
