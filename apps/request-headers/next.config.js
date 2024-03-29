/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui'],
  output: process.env.IS_DOCKER ? 'standalone' : undefined,
};

module.exports = nextConfig;
