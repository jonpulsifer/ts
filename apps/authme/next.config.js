/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  reactStrictMode: true,
  transpilePackages: ['@repo/ui'],
  output: process.env.IS_DOCKER ? 'standalone' : undefined,
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;
