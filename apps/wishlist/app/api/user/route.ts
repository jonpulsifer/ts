import { prisma } from 'lib/prisma';
import { isAuthenticated } from 'lib/prisma-ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  const { user } = await isAuthenticated();
  const { id, name, address, shoe_size, pant_size, shirt_size } =
    await req.json();

  if (!id || !user) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  if (user.id !== id) {
    return NextResponse.json(
      { error: 'You are not authorized to update this user' },
      { status: 403 },
    );
  }

  const updated = await prisma.user.update({
    where: {
      id,
    },
    data: {
      name,
      address,
      shoe_size,
      pant_size,
      shirt_size,
    },
  });
  return NextResponse.json({ updated });
}
