import type { NextConfig } from "next";

// Optional same-origin proxy to my-portfolio-backend (see README → Deployment). When set, the
// browser talks to /api/v1 on this site and auth cookies stay first-party even if the API lives
// on another domain. Leave unset when the API is called directly (NEXT_PUBLIC_API_URL).
const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Remote image hosts used by the centralized content data (see /data).
    // Add a host here before referencing images from a new provider with next/image.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
    qualities: [60, 75, 85],
  },
  async headers() {
    // Dashboard pages are never stored by the browser (also keeps them out of the back/forward cache after sign-out).
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
