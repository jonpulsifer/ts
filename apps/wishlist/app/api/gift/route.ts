import { prisma } from 'lib/prisma';
import { isAuthenticated } from 'lib/prisma-ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  await isAuthenticated();
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }

  const gift = await prisma.gift.findUnique({
    where: {
      id: id,
    },
    include: {
      owner: true,
      wishlists: true,
    },
  });
  return NextResponse.json(gift);
}

export async function POST(req: NextRequest) {
  const { user } = await isAuthenticated();
  const { id } = user;
  if (!id || !req.body) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  // create gift
  const { gift } = await req.json();
  const { name, url, description } = gift;
  const created = await prisma.gift.create({
    data: {
      name,
      url,
      description,
      owner: {
        connect: {
          id,
        },
      },
    },
  });
  return NextResponse.json({ created });
}

export async function DELETE(req: NextRequest) {
  const { user } = await isAuthenticated();
  const { id } = await req.json();
  if (!id || !req.body) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
  const gift = await prisma.gift.findUnique({
    where: {
      id,
    },
  });

  if (!gift) {
    return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
  }

  if (user.id !== gift.ownerId) {
    return NextResponse.json(
      { error: 'You are not the owner of this gift' },
      { status: 403 },
    );
  }

  const deleted = await prisma.gift.delete({
    where: {
      id,
    },
  });
  return NextResponse.json({ deleted });
}

export async function PATCH(req: NextRequest) {
  if (!req.body) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
  const { user } = await isAuthenticated();
  const { id, name, url, description } = await req.json();
  const gift = await prisma.gift.findUniqueOrThrow({
    where: {
      id,
    },
  });
  if (user.id !== gift.ownerId) {
    return NextResponse.json(
      { error: 'You are not the owner of this gift' },
      { status: 403 },
    );
  }

  const updated = await prisma.gift.update({
    where: {
      id,
    },
    data: {
      name,
      url,
      description,
    },
  });
  return NextResponse.json({ updated });
}
