import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@joblens/shared"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb"
    }
  }
};

export default nextConfig;
