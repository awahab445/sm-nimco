import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: '/newsletter', destination: '/subscriptions', permanent: true }];
  },
};

export default nextConfig;
