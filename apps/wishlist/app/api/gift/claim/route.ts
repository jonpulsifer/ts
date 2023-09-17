import { prisma } from 'lib/prisma';
import { isAuthenticated } from 'lib/prisma-ssr';
import { NextRequest, NextResponse } from 'next/server';

async function updateGiftClaim(id: string, userId: string, unclaim = false) {
  const data = unclaim
    ? {
        claimed: false,
        claimedById: null,
      }
    : {
        claimed: true,
        claimedById: userId,
      };
  const gift = await prisma.gift.update({
    where: {
      id,
    },
    data,
  });
  return NextResponse.json({ gift });
}

export async function POST(req: NextRequest) {
  const { user } = await isAuthenticated();
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  const { claimed, claimedById } = await prisma.gift.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const claimedBySameUser = user.id === claimedById;

  if (claimed) {
    return NextResponse.json(
      { error: 'This gift has already been claimed' },
      { status: 400 },
    );
  }

  if (claimedBySameUser && !claimed) {
    return NextResponse.json(
      { error: 'Gift already claimed by you' },
      { status: 400 },
    );
  }

  return await updateGiftClaim(id, user.id);
}

export async function DELETE(req: NextRequest) {
  const { user } = await isAuthenticated();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  const { claimed } = await prisma.gift.findUniqueOrThrow({
    where: {
      id,
    },
  });

  if (!claimed) {
    return NextResponse.json(
      { error: 'This gift not yet been claimed' },
      { status: 400 },
    );
  }

  return await updateGiftClaim(id, user.id, true);
}
