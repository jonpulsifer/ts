import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SOME_VARIABLE: process.env.NEXT_PUBLIC_SOME_VARIABLE,
  },
  output: process.env.IS_DOCKER ? "standalone" : undefined,
};

export default nextConfig;
