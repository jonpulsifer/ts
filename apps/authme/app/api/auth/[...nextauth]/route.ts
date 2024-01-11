import fs from 'fs';
import { authOptions } from 'lib/auth';
import NextAuth from 'next-auth';

const handler = NextAuth(authOptions);

console.log('Initializing Prisma on the function');
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
  // if file exists do not attempt to write it
  if (fs.existsSync(file.path)) {
    console.log(`File ${file.path} exists, skipping`);
    return;
  }
  const buf = Buffer.from(file.contents, 'base64');
  console.info(`Writing ${file.path} (${buf.length} bytes)`);
  fs.writeFileSync(file.path, buf);
});

export { handler as GET, handler as POST };
