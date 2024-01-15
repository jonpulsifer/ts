import NextAuth from 'next-auth';

import { authOptions } from '../../../../lib/auth';
import { writeEncodedCertsFromEnv } from '../../../../lib/certs';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- any
const handler = NextAuth(authOptions);

writeEncodedCertsFromEnv();

export { handler as GET, handler as POST };
