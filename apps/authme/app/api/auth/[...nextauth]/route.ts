import { authOptions } from 'lib/auth';
import { writeEncodedCertsFromEnv } from 'lib/certs';
import NextAuth from 'next-auth';

const handler = NextAuth(authOptions);

console.log('Initializing Prisma on the function');
writeEncodedCertsFromEnv();

export { handler as GET, handler as POST };
