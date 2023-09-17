import { prisma } from 'lib/prisma';
import { isAuthenticated } from 'lib/prisma-ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { user } = await isAuthenticated();
  const { id, password } = await req.json();
  if (!id || !password) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  const wishlist = await prisma.wishlist.findUniqueOrThrow({
    where: {
      id,
    },
  });

  if (wishlist.password !== password) {
    return NextResponse.json({ error: 'Pin does not match' }, { status: 403 });
  }

  const updated = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      wishlists: {
        connect: {
          id,
        },
      },
    },
  });
  return NextResponse.json({ user: updated });
}
