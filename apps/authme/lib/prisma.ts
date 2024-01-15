import { PrismaClient } from '@prisma/client';
import { writeEncodedCertsFromEnv } from './certs';

// eslint-disable-next-line no-undef -- Global is defined
declare const global: Global & { prisma?: PrismaClient };

// eslint-disable-next-line import/no-mutable-exports -- we do want to overwrite it sometimes
export let prisma: PrismaClient;

if (typeof window === 'undefined') {
  // console.log('Initializing Prisma on the server');
  writeEncodedCertsFromEnv();

  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
  }
}
