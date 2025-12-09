import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  output: process.env.STANDALONE ? 'standalone' : undefined,
};

export default nextConfig;
