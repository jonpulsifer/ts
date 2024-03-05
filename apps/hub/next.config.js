/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui'],
  output: 'standalone',
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
