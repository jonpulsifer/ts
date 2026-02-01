import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
