'use server';
import { Prisma, User } from '@prisma/client';
import { authOptions } from 'lib/auth';
import { prisma } from 'lib/prisma';
import { getServerSession } from 'next-auth/next';

const getRandomUser = async () => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return null;
  }
  const user = await prisma.user.findFirst();
  return user;
};

const getUserById = (id: string) => {
  try {
    const user = prisma.user.findUniqueOrThrow({
      where: {
        id,
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
  throw new Error('User not found');
};

const getMe = async () => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return null;
  }
  return session.user as User;
};

export { getMe, getRandomUser, getUserById };
