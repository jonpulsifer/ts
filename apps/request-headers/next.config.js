/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    typedRoutes: true,
  },
  reactStrictMode: true,
  output: process.env.IS_DOCKER ? 'standalone' : undefined,
};

module.exports = nextConfig;
