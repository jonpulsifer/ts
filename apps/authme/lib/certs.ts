import fs from 'fs';

export const writeEncodedCertsFromEnv = () => {
  const envToFileMap = {
    SERVER_CA: '/tmp/server-ca.pem',
    CLIENT_IDENTITY_PKCS12: '/tmp/client-identity.p12',
  };

  for (const [envVar, filePath] of Object.entries(envToFileMap)) {
    const content = process.env[envVar];

    // Throw if environment variable is not set since we need them for CloudSQL
    if (!content) {
      throw new Error(`Missing environment variable: ${envVar}`);
    }

    // Skip writing if the file already exists
    if (fs.existsSync(filePath)) {
      console.debug(`File already exists, skipping: ${filePath}`);
      continue;
    }

    // Decode and write content to file
    const decodedContent = Buffer.from(content, 'base64');
    fs.writeFileSync(filePath, decodedContent);
    console.debug(`File written: ${filePath} (${decodedContent.length} bytes)`);
  }
};
