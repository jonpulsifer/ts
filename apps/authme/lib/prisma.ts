import { PrismaClient } from '@prisma/client';
import fs from 'fs';

declare const global: Global & { prisma?: PrismaClient };

export let prisma: PrismaClient;

if (typeof window === 'undefined') {
  if (process.env['NODE_ENV'] === 'production') {
    const SERVER_CA = process.env.SERVER_CA;
    const CLIENT_IDENTITY_PKCS12 = process.env.CLIENT_IDENTITY_PKCS12;
    if (!SERVER_CA || !CLIENT_IDENTITY_PKCS12) {
      throw new Error('Missing environment variables');
    }
    [
      {
        contents: SERVER_CA,
        path: '/tmp/server-ca.pem',
      },
      {
        contents: CLIENT_IDENTITY_PKCS12,
        path: '/tmp/client-identity.p12',
      },
    ].forEach((file) => {
      const buf = Buffer.from(file.contents, 'base64');
      fs.writeFileSync(file.path, buf);
    });
    prisma = new PrismaClient();
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
  }
}
