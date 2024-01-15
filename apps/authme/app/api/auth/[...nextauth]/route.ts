import NextAuth from 'next-auth';

import { authOptions } from '../../../../lib/auth';
import { writeEncodedCertsFromEnv } from '../../../../lib/certs';

const handler = NextAuth(authOptions);

writeEncodedCertsFromEnv();

export { handler as GET, handler as POST };
