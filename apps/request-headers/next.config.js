/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: ['@repo/ui'],
  reactStrictMode: true,
  output: process.env.IS_DOCKER ? 'standalone' : undefined,
};

module.exports = nextConfig;
