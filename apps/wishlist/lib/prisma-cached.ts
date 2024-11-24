import { unstable_cache } from 'next/cache';
import prisma from './prisma';

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
    tags: ['peopleForNewGiftModal'],
  },
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
                  gte: new Date(`${new Date().getFullYear()}-01-01`),
                  lt: new Date(`${new Date().getFullYear() + 1}-01-01`),
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

export { getPeopleForNewGiftModal, getWishlistsWithMemberIds };
