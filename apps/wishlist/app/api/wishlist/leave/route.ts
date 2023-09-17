import { prisma } from 'lib/prisma';
import { isAuthenticated } from 'lib/prisma-ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { user } = await isAuthenticated();
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  const wishlist = await prisma.wishlist.findUniqueOrThrow({
    where: {
      id,
    },
  });

  if (!wishlist) {
    return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      wishlists: {
        disconnect: {
          id,
        },
      },
    },
  });
  return NextResponse.json({ user: updated });
}
