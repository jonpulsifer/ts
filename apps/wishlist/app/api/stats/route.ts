import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const gifts = await prisma.gift.count();
  const users = await prisma.user.count();
  const claimed = await prisma.gift.count({ where: { claimed: true } });
  return NextResponse.json(
    { gifts, users, claimed },
    {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate',
      },
    },
  );
}
