import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverSourceMaps: false,
  },
  images: {
    // Higher quality = better for our small album art, trade-off is worth it
    // Lower quality reduces file size more aggressively
    qualities: [60, 75, 90],
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for 30 days on CDN
    minimumCacheTTL: 2592000,
  },
  async headers() {
    return [
      {
        // Static covers: immutable for 1 year
        source: "/covers/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/og-default.jpg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
      {
        // Static JS/CSS chunks: immutable for 1 year
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
