import { User } from '@prisma/client';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';

import {
  GiftWithOwner,
  UserWithGifts,
  UserWithGiftsAndWishlists,
  UserWithGiftsWithOwners,
} from '../types/prisma';
import { authOptions } from './auth';
import { prisma } from './prisma';

const getMe = async (): Promise<User> => {
  const session = await isAuthenticated();
  const { id } = session.user;
  return getUserById(id, false, false);
};

const getMeWithGifts = async (): Promise<UserWithGiftsWithOwners> => {
  const session = await isAuthenticated();
  const { id } = session.user;
  return prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      gifts: {
        include: {
          owner: true,
        },
      },
    },
  });
};

const getUserWithGifts = async (id: string): Promise<UserWithGifts> => {
  return getUserById(id, true, false);
};

const getMeWithGiftsAndWishlists =
  async (): Promise<UserWithGiftsAndWishlists> => {
    const session = await isAuthenticated();
    const { id } = session.user;
    return getUserById(id, true, true);
  };

const getUserById = async (id: string, gifts = false, wishlists = false) => {
  return prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      gifts: gifts,
      wishlists: wishlists,
    },
  });
};

const getGiftById = async (id: string, owner = false, claimedBy = false) => {
  return prisma.gift.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      owner: owner,
      claimedBy: claimedBy,
    },
  });
};

const getUserWithGiftsById = async (id: string): Promise<UserWithGifts> => {
  return getUserById(id, true, false);
};

const getClaimedGiftsForMe = async (): Promise<GiftWithOwner[]> => {
  const session = await isAuthenticated();
  const id = session.user?.id;
  return prisma.gift.findMany({
    where: {
      claimedById: {
        equals: id,
      },
    },
    include: {
      owner: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

const getVisibleGiftsForUserById = async (id: string) => {
  const session = await isAuthenticated();
  const currentUserId = session.user?.id;
  return prisma.gift.findMany({
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
        ],
      },
    },
    include: {
      owner: true,
      claimedBy: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

const isAuthenticated = async () => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    console.log('could not get user from session, redirecting to login');
    redirect('/login');
  }
  return session;
};

const getVisibleGiftsForUser = async () => {
  const session = await isAuthenticated();
  const { id } = session.user;
  const user = await getUserById(id, true, true);
  if (!user.wishlists || !user.wishlists.length) return { gifts: [] };

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
          ],
        },
      },
      include: {
        owner: true,
        claimedBy: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return { gifts };
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
      },
    });
    const user = await getUserById(id, false, true);

    return { wishlists, user };
  } catch (e) {
    console.log(JSON.stringify(e));
  }
  redirect('/login');
};

const getPeopleForUser = async () => {
  const session = await isAuthenticated();
  const { id } = session.user!;
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
        NOT: { id },
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
              ],
            },
          },
        },
      },
    });
    const user = await getUserById(id, false, true);
    return { users: users, user };
  } catch (e) {
    console.log('error in getPeopleForUser', JSON.stringify(e));
  }
  redirect('/login');
};

export {
  getClaimedGiftsForMe,
  getGiftById,
  getMe,
  getMeWithGifts,
  getMeWithGiftsAndWishlists,
  getPeopleForUser,
  getUserById,
  getUserWithGifts,
  getUserWithGiftsById,
  getVisibleGiftsForUser,
  getVisibleGiftsForUserById,
  getWishlists,
  isAuthenticated,
};
