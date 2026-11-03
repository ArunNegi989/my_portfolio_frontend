import type { NextConfig } from "next";

const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");

const nextConfig: NextConfig = {

    deploymentId: process.env.NEXT_DEPLOYMENT_ID,
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // Custom cache profile used by lib/data.ts. After `expire` passes, visitors would otherwise wait on
  // the backend; with a long expire they get the cached copy instantly while it refreshes in the
  // background. The backend still calls /api/revalidate after every admin change.
  cacheLife: {
    content: {
      stale: 300, // browser router cache: 5 min
      revalidate: 300, // refresh in the background after 5 min
      expire: 60 * 60 * 24 * 7, // serve cached content for up to 7 days without blocking
    },
  },
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
      // Tells Nginx not to buffer streamed (RSC) responses, which can cut them off mid-stream.
      { source: "/:path*", headers: [{ key: "X-Accel-Buffering", value: "no" }] },
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