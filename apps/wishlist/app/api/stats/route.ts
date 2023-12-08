import { prisma } from 'lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const gifts = await prisma.gift.count();
  const users = await prisma.user.count();
  const claimed = await prisma.gift.count({ where: { claimed: true } });
  return NextResponse.json({ gifts, users, claimed });
}
