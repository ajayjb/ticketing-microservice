import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    new URL(process.env.NEXT_PUBLIC_DOMAIN as string).hostname,
  ],
  webpack: (config) => {
    return {
      ...config,
      watchOptions: {
        ...config.watchOptions,
        poll: 300,
      },
    };
  },
};

export default nextConfig;
