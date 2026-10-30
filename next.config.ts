
import type { NextConfig } from "next";

const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: false,
  partialPrefetching: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
    qualities: [60, 75, 85],
  },
  async headers() {
    const noStore = [{ key: "Cache-Control", value: "no-store, max-age=0" }];
    return [
      { source: "/admin", headers: noStore },
      { source: "/admin/:path*", headers: noStore },
    ];
  },
  async rewrites() {
    if (!apiProxyTarget) return [];
    return [
      { source: "/api/v1/:path*", destination: `${apiProxyTarget}/api/v1/:path*` },
      { source: "/uploads/:path*", destination: `${apiProxyTarget}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
