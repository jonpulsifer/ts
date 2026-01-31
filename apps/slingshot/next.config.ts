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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "media-src 'self' data: blob:; default-src 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
