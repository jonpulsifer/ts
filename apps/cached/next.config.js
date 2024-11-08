/** @type {import('next').NextConfig} */

const nextConfig = {
  cacheHandler:
    process.env.NODE_ENV === 'production'
      ? require.resolve('./lib/cache-handler.js')
      : undefined,
  cacheMaxMemorySize: 0, // disable the default (50mb) in-memory cache
  output: process.env.STANDALONE ? 'standalone' : undefined,
};

module.exports = nextConfig;
