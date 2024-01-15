import { PrismaClient } from '@prisma/client';

// eslint-disable-next-line no-undef -- yes it is
declare const global: Global & { prisma?: PrismaClient };

// eslint-disable-next-line import/no-mutable-exports -- we have to
export let prisma: PrismaClient;

if (typeof window === 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
  }
}
