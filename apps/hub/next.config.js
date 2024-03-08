/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui'],
  output: process.env.IS_DOCKER === '1' ? 'standalone' : undefined,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
