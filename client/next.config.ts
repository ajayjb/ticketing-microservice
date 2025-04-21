import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["tickets.com"],
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
