/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
