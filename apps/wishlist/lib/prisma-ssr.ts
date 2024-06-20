/* eslint-disable no-console -- because we like to log */
import { Prisma } from '@prisma/client';
import { auth } from 'app/auth';
import { redirect } from 'next/navigation';

import type {
  UserWithGifts,
  UserWithGiftsAndWishlists,
  UserWithGiftsWithOwners,
} from '../types/prisma';
import { prisma } from './prisma';

const getMe = async () => {
  const session = await isAuthenticated();
  const { id } = session.user;
  return getUserById(id, false, false);
};

const getMeWithGifts = async (): Promise<UserWithGiftsWithOwners> => {
  const session = await isAuthenticated();
  const { id } = session.user;
  try {
    const user = prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        gifts: {
          include: {
            owner: true,
            createdBy: true,
          },
        },
      },
    });
    return user;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025' || e.code === 'P2016') {
        console.error('User not found');
      }
    }
    console.error('getMeWithGifts', JSON.stringify(e));
  }
  return redirect('/login');
};

const getGiftsWithOwnerByUserId = async (id: string) => {
  await isAuthenticated();
  try {
    const gifts = await prisma.gift.findMany({
      where: {
        ownerId: id,
      },
      include: {
        owner: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return gifts;
  } catch (e) {
    console.error('getGiftsWithOwnerByUserId', JSON.stringify(e));
  }
  return redirect('/login');
};

const getUserWithGifts = async (id: string) => {
  return getUserById(id, true, false);
};

const getMeWithGiftsAndWishlists =
  async (): Promise<UserWithGiftsAndWishlists> => {
    const session = await isAuthenticated();
    const { id } = session.user;
    return getUserById(id, true, true);
  };

const getUserById = async (
  id: string,
  gifts = false,
  wishlists = false,
  createdBy = false,
) => {
  try {
    const user = prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        gifts: gifts ? { include: { createdBy } } : undefined,
        wishlists,
      },
    });
    return user;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025' || e.code === 'P2016') {
        console.error('User not found');
      }
    }
    console.error('getUserById', JSON.stringify(e));
  }
  return redirect('/login');
};

const getGiftById = async (
  id: string,
  owner = false,
  claimedBy = false,
  createdBy = false,
) => {
  try {
    const gift = await prisma.gift.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        owner,
        claimedBy,
        createdBy,
      },
    });
    return gift;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025' || e.code === 'P2016') {
        console.error('Gift not found');
      }
    }
    console.error('getGiftById', JSON.stringify(e));
  }
};

const getUserWithGiftsById = async (id: string): Promise<UserWithGifts> => {
  return getUserById(id, true, false);
};

const getClaimedGiftsForMe = async () => {
  const session = await isAuthenticated();
  const user = session.user;
  const gifts = await prisma.gift.findMany({
    where: {
      claimedById: {
        equals: session.user.id,
      },
    },
    include: {
      owner: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
  return { gifts, user };
};

const getVisibleGiftsForUserById = async (id: string) => {
  const session = await isAuthenticated();
  const currentUserId = session.user.id;
  const gifts = await prisma.gift.findMany({
    where: {
      ownerId: id,
      AND: {
        OR: [
          { claimed: false },
          {
            claimed: true,
            claimedBy: {
              id: currentUserId,
            },
          },
          { createdBy: { id: currentUserId } },
        ],
      },
    },
    include: {
      owner: true,
      claimedBy: true,
      createdBy: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
  return { gifts, user: session.user };
};

const isAuthenticated = async () => {
  const session = await auth();
  if (!session || !session?.user) {
    console.error(
      'could not get session or user from session, redirecting to login',
    );
    return redirect('/login');
  }
  return session;
};

const getVisibleGiftsForUser = async () => {
  const session = await isAuthenticated();
  const { id } = session.user;
  const user = await getUserById(id, true, true);
  if (!user.wishlists.length) return { gifts: [], user: session.user };

  try {
    const wishlistIds = user.wishlists.map((w) => w.id);
    const gifts = await prisma.gift.findMany({
      where: {
        ownerId: { not: id },
        wishlists: { some: { id: { in: wishlistIds } } },
        AND: {
          OR: [
            { claimed: false },
            {
              claimed: true,
              claimedBy: {
                id,
              },
            },
            { createdBy: { id } },
          ],
        },
      },
      include: {
        owner: true,
        claimedBy: true,
        createdBy: true,
      },
      orderBy: [
        {
          owner: { name: 'asc' },
        },
        {
          name: 'asc',
        },
      ],
    });
    return { gifts, user: session.user };
  } catch (e) {
    console.log(JSON.stringify(e));
  }
  redirect('/login');
};

const getSortedVisibleGiftsForUser = async (sortDirection: string) => {
  const session = await isAuthenticated();
  const { id } = session.user;
  const user = await getUserById(id, true, true);
  if (!user.wishlists.length) return { gifts: [], user: session.user };

  try {
    const direction = sortDirection === 'asc' ? 'asc' : 'desc';
    const wishlistIds = user.wishlists.map((w) => w.id);
    const gifts = await prisma.gift.findMany({
      where: {
        ownerId: { not: id },
        wishlists: { some: { id: { in: wishlistIds } } },
        AND: {
          OR: [
            { claimed: false },
            {
              claimed: true,
              claimedBy: {
                id,
              },
            },
            { createdBy: { id } },
          ],
        },
      },
      include: {
        owner: true,
        claimedBy: true,
        createdBy: true,
      },
      orderBy: [
        {
          name: direction,
        },
      ],
    });
    return { gifts, user: session.user };
  } catch (e) {
    console.log(JSON.stringify(e));
  }
  redirect('/login');
};

const getWishlists = async () => {
  const session = await isAuthenticated();
  const { id } = session.user;
  try {
    const wishlists = await prisma.wishlist.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            members: true,
            gifts: true,
          },
        },
      },
    });
    const user = await getUserById(id, false, true);

    return { wishlists, user };
  } catch (e) {
    console.error('getWishlists', JSON.stringify(e));
  }
  return redirect('/login');
};

const getPeopleForUser = async () => {
  const session = await isAuthenticated();
  const { id } = session.user;
  try {
    const users = await prisma.user.findMany({
      where: {
        wishlists: {
          some: {
            members: {
              some: {
                id,
              },
            },
          },
        },
        // NOT: { id },
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        gifts: {
          where: {
            AND: {
              OR: [
                { claimed: false },
                {
                  claimed: true,
                  claimedBy: {
                    id,
                  },
                },
                { createdBy: { id } },
              ],
            },
          },
        },
      },
    });
    const user = await getUserById(id, false, true);
    return { users, user };
  } catch (e) {
    console.error('getPeopleForUser', JSON.stringify(e));
  }
  redirect('/login');
};

export {
  getClaimedGiftsForMe,
  getGiftById,
  getGiftsWithOwnerByUserId,
  getMe,
  getMeWithGifts,
  getMeWithGiftsAndWishlists,
  getPeopleForUser,
  getSortedVisibleGiftsForUser,
  getUserById,
  getUserWithGifts,
  getUserWithGiftsById,
  getVisibleGiftsForUser,
  getVisibleGiftsForUserById,
  getWishlists,
  isAuthenticated,
};
