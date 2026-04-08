import type { NextConfig } from "next";

const hostname = new URL(process.env.NEXT_PUBLIC_DOMAIN as string).hostname;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [hostname],
  webpack: (config) => {
    return {
      ...config,
      watchOptions: {
        ...config.watchOptions,
        poll: 300,
      },
    };
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
