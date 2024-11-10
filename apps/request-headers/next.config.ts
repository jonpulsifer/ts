import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ENVIRONMENT_VARIABLE: "bundled",
  },
  output: process.env.STANDALONE ? "standalone" : undefined,
};

export default nextConfig;
