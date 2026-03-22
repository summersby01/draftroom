import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  outputFileTracingRoot: process.cwd()
};

export default nextConfig;
