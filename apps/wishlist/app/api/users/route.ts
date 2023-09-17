import { prisma } from 'lib/prisma';
import { isAuthenticated } from 'lib/prisma-ssr';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await isAuthenticated();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const users = await prisma.user.findMany({
    include: {
      gifts: true,
      wishlists: true,
    },
  });
  return NextResponse.json(users);
}
