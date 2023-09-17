import { prisma } from 'lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const gifts = prisma.gift.count();
  const users = prisma.user.count();
  const claimed = prisma.gift.count({ where: { claimed: true } });
  return NextResponse.json({ gifts, users, claimed });
}
