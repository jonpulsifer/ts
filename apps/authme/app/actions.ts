/* eslint-disable no-console -- this is wild */
/* eslint-disable @typescript-eslint/no-unsafe-member-access -- this is wild */
/* eslint-disable @typescript-eslint/no-explicit-any -- this is wild */
'use server';
import type { User } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../lib/auth';
import { prisma } from '../lib/prisma';

const getRandomUser = async (): Promise<User | null> => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  const user = await prisma.user.findFirst();
  return user;
};

const getUserById = (id: string): Promise<User> => {
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

const getMe = async (): Promise<User | null> => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session.user as User;
};

interface DatabaseInfo {
  version: string;
  connections: string;
  maxConnections: string;
}

const getDatabaseInfo = async (): Promise<DatabaseInfo> => {
  // Execute the database queries
  const dbVersionResult: any[] = await prisma.$queryRaw`SELECT version();`;
  const currentConnectionsResult: any[] =
    await prisma.$queryRaw`SELECT COUNT(1) FROM pg_stat_activity;`;
  const maxConnectionsResult: any[] =
    await prisma.$queryRaw`SHOW max_connections;`;

  // Extract and type assert the results
  const version = String(dbVersionResult[0]?.version) || 'Unknown';
  const connections = String(currentConnectionsResult[0]?.count) || '0';
  const maxConnections =
    String(maxConnectionsResult[0]?.max_connections) || '0';

  return {
    version,
    connections,
    maxConnections,
  };
};

export { getDatabaseInfo, getMe, getRandomUser, getUserById };
