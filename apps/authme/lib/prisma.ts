import { PrismaClient } from '@prisma/client';

// import { writeEncodedCertsFromEnv } from './certs';

declare const global: Global & { prisma?: PrismaClient };

export let prisma: PrismaClient;

if (typeof window === 'undefined') {
  // console.log('Initializing Prisma on the server');
  // writeEncodedCertsFromEnv();

  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
  }
}
