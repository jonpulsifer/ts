import { Prisma } from '@prisma/client';
import { auth } from 'app/auth';
import { redirect } from 'next/navigation';
import OpenAI from 'openai';

import type {
  UserWithGifts,
  UserWithGiftsAndWishlists,
  UserWithGiftsWithOwners,
} from '../types/prisma';
import prisma from './prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getMe = async () => {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      secretSantaParticipations: {
        include: {
          event: true,
          assignedTo: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

const getMeWithGifts = async (): Promise<UserWithGiftsWithOwners> => {
  const session = await isAuthenticated();
  const { id } = session.user;
  const currentYear = new Date().getFullYear();

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
          where: {
            createdAt: {
              gte: new Date(`${currentYear}-01-01`),
              lt: new Date(`${currentYear + 1}-01-01`),
            },
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
  const currentYear = new Date().getFullYear();
  try {
    const gifts = await prisma.gift.findMany({
      where: {
        ownerId: id,
        createdById: id,
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
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
  const currentYear = new Date().getFullYear();
  try {
    const user = prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        gifts: gifts
          ? {
              where: {
                createdAt: {
                  gte: new Date(`${currentYear}-01-01`),
                  lt: new Date(`${currentYear + 1}-01-01`),
                },
              },
              include: { createdBy },
            }
          : undefined,
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
  await isAuthenticated();
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
  const currentYear = new Date().getFullYear();
  const gifts = await prisma.gift.findMany({
    where: {
      claimedById: {
        equals: session.user.id,
      },
      createdAt: {
        gte: new Date(`${currentYear}-01-01`),
        lt: new Date(`${currentYear + 1}-01-01`),
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
  const currentYear = new Date().getFullYear();
  const gifts = await prisma.gift.findMany({
    where: {
      ownerId: id,
      createdById: id,
      createdAt: {
        gte: new Date(`${currentYear}-01-01`),
        lt: new Date(`${currentYear + 1}-01-01`),
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
  });
  return { gifts, user: session.user };
};

const getLatestVisibleGiftsForUserById = async (id: string) => {
  const session = await isAuthenticated();
  const currentUserId = session.user.id;
  const currentYear = new Date().getFullYear();
  const gifts = await prisma.gift.findMany({
    where: {
      createdAt: {
        gte: new Date(`${currentYear}-01-01`),
        lt: new Date(`${currentYear + 1}-01-01`),
      },
      ownerId: { not: id },
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
      createdBy: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
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
    const currentYear = new Date().getFullYear();
    const wishlistIds = user.wishlists.map((w) => w.id);
    const gifts = await prisma.gift.findMany({
      where: {
        ownerId: { not: id },
        wishlists: { some: { id: { in: wishlistIds } } },
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
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

const getSortedVisibleGiftsForUser = async ({
  column = 'name',
  direction = 'asc',
}: {
  direction?: 'asc' | 'desc';
  column?: 'name' | 'owner';
}) => {
  const session = await isAuthenticated();
  const { id } = session.user;
  const user = await getUserById(id, true, true);
  if (!user.wishlists.length) return { gifts: [], user: session.user };

  const orderBy =
    column === 'owner' ? { owner: { name: direction } } : { name: direction };
  const currentYear = new Date().getFullYear();
  try {
    const wishlistIds = user.wishlists.map((w) => w.id);
    const gifts = await prisma.gift.findMany({
      where: {
        ownerId: { not: id },
        wishlists: { some: { id: { in: wishlistIds } } },
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
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
      include: {
        owner: true,
        claimedBy: true,
        createdBy: true,
      },
      orderBy: [orderBy],
    });
    return { gifts, user: session.user };
  } catch (e) {
    console.log(JSON.stringify(e));
  }
  redirect('/login');
};

const getUsersForPeoplePage = async () => {
  const session = await isAuthenticated();
  const { id } = session.user;
  const currentYear = new Date().getFullYear();
  return prisma.user.findMany({
    include: {
      gifts: {
        where: {
          createdAt: {
            gte: new Date(`${currentYear}-01-01`),
          },
        },
      },
    },
    where: {
      wishlists: {
        some: {
          members: { some: { id } },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
};

const getWishlists = async () => {
  const session = await isAuthenticated();
  const { id } = session.user;
  const currentYear = new Date().getFullYear();
  try {
    const wishlists = await prisma.wishlist.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            members: true,
            gifts: {
              where: {
                createdAt: {
                  gte: new Date(`${currentYear}-01-01`),
                  lt: new Date(`${currentYear + 1}-01-01`),
                },
              },
            },
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
  const currentYear = new Date().getFullYear();
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
            createdAt: {
              gte: new Date(`${currentYear}-01-01`),
              lt: new Date(`${currentYear + 1}-01-01`),
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
    });
    const user = await getUserById(id, false, true);
    return { users, user };
  } catch (e) {
    console.error('getPeopleForUser', JSON.stringify(e));
  }
  redirect('/login');
};

const getRecommendations = async (userId: string) => {
  const gifts = await getGiftsWithOwnerByUserId(userId);
  const preferences = gifts.map((gift) => gift.name).join(', ');
  const name = gifts[0]?.owner?.name?.split(' ')[0] || 'someone mysterious';
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Ho ho ho! I'm Santa Claus, here to help you pick the perfect Christmas gifts for someone special. Based on their wishlist items, suggest a wide variety of delightful and unique presents that will bring joy and cheer this holiday season. Format your output in plain text, no markdown. Do not recommend items that are part of the wishlist already. Respond playfully in only a few sentences. Begin your response with a fun summary about the recipient's gifts. Include your reasoning.`,
      },
      {
        role: 'user',
        content: `The person I'm buying for is named: ${name} and has these items on their Christmas wishlist: ${preferences}. What would Santa recommend as great Christmas gifts for them?`,
      },
    ],
    temperature: 0.2,
  });

  return completion.choices[0]?.message?.content;
};

type GiftRecommendation = {
  name: string;
  description: string;
  estimatedPrice?: string;
};

const getRecommendationsForHomePage = async (
  userId: string,
): Promise<GiftRecommendation[]> => {
  const gifts = await getGiftsWithOwnerByUserId(userId);
  const preferences = gifts.map((gift) => gift.name).join(', ');
  const name = gifts[0]?.owner?.name?.split(' ')[0] || 'someone mysterious';

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    functions: [
      {
        name: 'get_gift_recommendations',
        description: 'Get gift recommendations for the user',
        parameters: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  estimatedPrice: { type: 'string' },
                },
                required: ['name', 'description'],
              },
            },
          },
        },
      },
    ],
    function_call: { name: 'get_gift_recommendations' },
    messages: [
      {
        role: 'system',
        content: `You are a gift recommendation expert. Based on a user's wishlist, suggest 5 unique and thoughtful gift ideas. Each recommendation should include a name, description, and estimated price range. Be creative and consider the user's interests.`,
      },
      {
        role: 'user',
        content: `The person I'm buying for is named: ${name} and has these items on their Christmas wishlist: ${preferences}. What would you recommend as great gift ideas for them?`,
      },
    ],
    temperature: 0.7,
  });

  const functionCall = completion.choices[0]?.message?.function_call;
  if (functionCall && functionCall.name === 'get_gift_recommendations') {
    const recommendations: { recommendations: GiftRecommendation[] } =
      JSON.parse(functionCall.arguments || '{}');
    return recommendations.recommendations;
  }

  return [];
};

const getUserOnboardingStatus = async (userId: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { hasCompletedOnboarding: true },
    });
    return user.hasCompletedOnboarding;
  } catch (e) {
    console.error('getUserOnboardingStatus error:', e);
    return false; // Assume onboarding is not completed if there's an error
  }
};

const updateUserOnboardingStatus = async (
  userId: string,
  status: boolean,
): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { hasCompletedOnboarding: status },
    });
  } catch (e) {
    console.error('updateUserOnboardingStatus error:', e);
    throw e;
  }
};

export async function getSecretSantaEvents(userId: string) {
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
}

export {
  getClaimedGiftsForMe,
  getGiftById,
  getGiftsWithOwnerByUserId,
  getLatestVisibleGiftsForUserById,
  getMe,
  getMeWithGifts,
  getMeWithGiftsAndWishlists,
  getPeopleForUser,
  getRecommendations,
  getRecommendationsForHomePage,
  getSortedVisibleGiftsForUser,
  getUserById,
  getUserOnboardingStatus,
  getUserWithGifts,
  getUserWithGiftsById,
  getUsersForPeoplePage,
  getVisibleGiftsForUser,
  getVisibleGiftsForUserById,
  getWishlists,
  isAuthenticated,
  updateUserOnboardingStatus,
};

export type { GiftRecommendation };
