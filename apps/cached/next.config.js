/** @type {import('next').NextConfig} */

const nextConfig = {
  cacheHandler:
    process.env.HAS_REDIS
      ? require.resolve('./lib/cache-handler.js')
      : undefined,
  cacheMaxMemorySize: process.env.HAS_REDIS ? 0 : undefined, // disable the default (50mb) in-memory cache
  output: process.env.STANDALONE ? 'standalone' : undefined,
};

module.exports = nextConfig;
