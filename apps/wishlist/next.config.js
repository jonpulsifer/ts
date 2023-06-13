/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  transpilePackages: ['ui'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

const isDev = process.env.NODE_ENV === 'development';
const ContentSecurityPolicy = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' apis.google.com cdn.vercel-insights.com ${
      isDev && "'unsafe-eval'"
    };
    frame-src 'self' ${isDev ? '*' : 'firebees.firebaseapp.com'};
    child-src 'self';
    style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com fonts.googleapis.com;
    img-src * blob: data:;
    media-src 'none';
    connect-src 'self' ${
      isDev ? '*' : '*.googleapis.com vitals.vercel-insights.com'
    };
    font-src 'self' cdnjs.cloudflare.com fonts.gstatic.com;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, '').trim(),
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // {
  //   key: 'Cross-Origin-Embedder-Policy',
  //   value: 'credentialless',
  // },
  // {
  //   key: 'Cross-Origin-Opener-Policy',
  //   value: 'same-origin',
  // },
];

module.exports = nextConfig;
