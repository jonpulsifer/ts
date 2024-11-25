import { Prisma } from '@prisma/client';
import { auth } from 'app/auth';
import { redirect } from 'next/navigation';
import OpenAI from 'openai';

import db from './client';
import type { GiftRecommendation } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getMe = async () => {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  const user = await db.user.findUnique({
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

const getGiftsWithOwnerByUserId = async (id: string) => {
  await isAuthenticated();
  const currentYear = new Date().getFullYear();
  try {
    const gifts = await db.gift.findMany({
      where: {
        ownerId: id,
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

const getUserById = async (
  id: string,
  gifts = false,
  wishlists = false,
  createdBy = false,
) => {
  const currentYear = new Date().getFullYear();
  try {
    const user = db.user.findUniqueOrThrow({
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
  try {
    const gift = await db.gift.findUniqueOrThrow({
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

const getPeopleForUser = async () => {
  const session = await isAuthenticated();
  const { id } = session.user;
  const currentYear = new Date().getFullYear();
  try {
    const users = await db.user.findMany({
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
    temperature: 1.0,
  });

  return completion.choices[0]?.message?.content;
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
    temperature: 1.0,
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
    const user = await db.user.findUniqueOrThrow({
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
    await db.user.update({
      where: { id: userId },
      data: { hasCompletedOnboarding: status },
    });
  } catch (e) {
    console.error('updateUserOnboardingStatus error:', e);
    throw e;
  }
};

export {
  getGiftById,
  getGiftsWithOwnerByUserId,
  getMe,
  getPeopleForUser,
  getRecommendations,
  getRecommendationsForHomePage,
  getUserById,
  getUserOnboardingStatus,
  isAuthenticated,
  updateUserOnboardingStatus,
};

export type { GiftRecommendation };
