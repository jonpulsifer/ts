import { unstable_cache } from 'next/cache';
import prisma from './prisma';

const CURRENT_YEAR = new Date().getFullYear();

const getPeopleForNewGiftModal = unstable_cache(
  async (userId: string) =>
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      where: {
        wishlists: {
          some: {
            members: { some: { id: userId } },
          },
        },
      },
    }),
  ['peopleForNewGiftModal'],
  {
    tags: ['peopleForNewGiftModal', 'users'],
  },
);

const getUsersWithGiftCount = unstable_cache(
  async (id: string) =>
    await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        _count: {
          select: {
            gifts: {
              where: {
                createdAt: {
                  gte: new Date(`${CURRENT_YEAR}-01-01`),
                  lt: new Date(`${CURRENT_YEAR + 1}-01-01`),
                },
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
        },
      },
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
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ['usersWithGiftCount'],
  { tags: ['usersWithGiftCount', 'users', 'gifts'] },
);

const getWishlistsWithMemberIds = unstable_cache(
  async () =>
    prisma.wishlist.findMany({
      select: {
        id: true,
        name: true,
        members: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            members: true,
            gifts: {
              where: {
                createdAt: {
                  gte: new Date(`${CURRENT_YEAR}-01-01`),
                  lt: new Date(`${CURRENT_YEAR + 1}-01-01`),
                },
              },
            },
          },
        },
      },
    }),
  ['wishlists'],
  {
    tags: ['wishlists'],
  },
);

const getUsers = unstable_cache(async () => prisma.user.findMany(), ['users'], {
  tags: ['users'],
});

const getUserById = unstable_cache(
  async (id: string) => prisma.user.findUnique({ where: { id } }),
  ['userById'],
  { tags: ['userById'] },
);

const getFullUserById = unstable_cache(
  async (id: string) =>
    prisma.user.findUnique({
      where: { id },
      include: {
        wishlists: true,
        secretSantaParticipations: true,
        gifts: true,
      },
    }),
  ['fullUserById'],
  { tags: ['fullUserById', 'users'] },
);

const getVisibleGiftsForUserById = unstable_cache(
  async (id: string, currentUserId: string) =>
    prisma.gift.findMany({
      where: {
        ownerId: id,
        createdById: currentUserId === id ? id : undefined,
        createdAt: {
          gte: new Date(`${CURRENT_YEAR}-01-01`),
          lt: new Date(`${CURRENT_YEAR + 1}-01-01`),
        },
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
    }),
  ['visibleGiftsForUserById'],
  { tags: ['visibleGiftsForUserById', 'gifts'] },
);

const getUsersForPeoplePage = unstable_cache(
  async (currentUserId: string) =>
    prisma.user.findMany({
      include: {
        _count: {
          select: {
            gifts: {
              where: {
                createdAt: {
                  gte: new Date(`${CURRENT_YEAR}-01-01`),
                },
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
            },
          },
        },
      },
      where: {
        wishlists: {
          some: {
            members: { some: { id: currentUserId } },
          },
        },
        AND: {
          NOT: {
            id: currentUserId,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ['people'],
  { tags: ['people', 'gifts'] },
);

const getGiftsWithOwnerClaimedByAndCreatedBy = unstable_cache(
  async () =>
    prisma.gift.findMany({
      select: {
        id: true,
        name: true,
        ownerId: true,
        createdById: true,
        claimedById: true,
        url: true,
        description: true,
        owner: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        claimedBy: { select: { id: true, name: true, email: true } },
      },
      where: {
        createdAt: {
          gte: new Date(`${CURRENT_YEAR}-01-01`),
          lt: new Date(`${CURRENT_YEAR + 1}-01-01`),
        },
      },
    }),
  ['gifts'],
  {
    tags: ['gifts'],
  },
);

const getClaimedGiftsForMe = unstable_cache(
  async (currentUserId: string) =>
    prisma.gift.findMany({
      where: {
        claimedById: {
          equals: currentUserId,
        },
        createdAt: {
          gte: new Date(`${CURRENT_YEAR}-01-01`),
          lt: new Date(`${CURRENT_YEAR + 1}-01-01`),
        },
      },
      include: {
        owner: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ['claimedGiftsForMe'],
  {
    tags: ['claimedGiftsForMe', 'gifts', 'claimed'],
  },
);

const getGiftWithOwnerClaimedByAndCreatedBy = unstable_cache(
  async (id: string) =>
    prisma.gift.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        ownerId: true,
        createdById: true,
        claimedById: true,
        url: true,
        description: true,
        owner: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        claimedBy: { select: { id: true, name: true, email: true } },
      },
    }),
  ['fullGiftById'],
  {
    tags: ['fullGiftById', 'gifts'],
  },
);

const getSortedVisibleGiftsForUser = unstable_cache(
  async ({
    column = 'name',
    direction = 'asc',
    userId,
  }: {
    direction?: 'asc' | 'desc';
    column?: 'name' | 'owner';
    userId: string;
  }) => {
    const orderBy =
      column === 'owner' ? { owner: { name: direction } } : { name: direction };
    return prisma.gift.findMany({
      where: {
        NOT: { ownerId: userId },
        wishlists: {
          some: {
            members: { some: { id: userId } },
          },
        },
        createdAt: {
          gte: new Date(`${CURRENT_YEAR}-01-01`),
          lt: new Date(`${CURRENT_YEAR + 1}-01-01`),
        },
        OR: [
          { claimed: false },
          { claimedById: userId },
          { createdById: userId },
        ],
      },
      include: {
        owner: true,
        claimedBy: true,
        createdBy: true,
      },
      orderBy: [orderBy],
    });
  },
  ['sortedVisibleGifts'],
  { tags: ['gifts', 'sortedVisibleGifts'] },
);

const getLatestVisibleGiftsForUserById = unstable_cache(
  async (id: string) =>
    prisma.gift.findMany({
      where: {
        createdAt: {
          gte: new Date(`${CURRENT_YEAR}-01-01`),
          lt: new Date(`${CURRENT_YEAR + 1}-01-01`),
        },
        ownerId: { not: id },
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
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    }),
  ['latestVisibleGiftsForUserById'],
  { tags: ['gifts', 'latestVisibleGiftsForUserById'] },
);

const getSecretSantaEvents = unstable_cache(
  async (userId: string) => {
    const events = await prisma.secretSantaEvent.findMany({
      include: {
        participants: {
          include: {
            user: true,
            assignedTo: true,
          },
        },
      },
    });

    return events.map((event) => ({
      ...event,
      isParticipating: event.participants.some((p) => p.userId === userId),
      canJoin:
        !event.participants.some((p) => p.userId === userId) &&
        !event.participants.some((p) => p.assignedToId),
    }));
  },
  ['secretSantaEvents'],
  { tags: ['secretSantaEvents'] },
);

export {
  getSecretSantaEvents,
  getSortedVisibleGiftsForUser,
  getGiftWithOwnerClaimedByAndCreatedBy,
  getGiftsWithOwnerClaimedByAndCreatedBy,
  getPeopleForNewGiftModal,
  getWishlistsWithMemberIds,
  getUsers,
  getUsersWithGiftCount,
  getUserById,
  getFullUserById,
  getVisibleGiftsForUserById,
  getUsersForPeoplePage,
  getClaimedGiftsForMe,
  getLatestVisibleGiftsForUserById,
};
