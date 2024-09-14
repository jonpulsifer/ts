/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui'],
  output: process.env.STANDALONE ? 'standalone' : undefined,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
