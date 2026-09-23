import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Browsers and some crawlers request /favicon.ico directly; serve the generated app icon (src/app/icon.tsx).
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
};

export default nextConfig;
