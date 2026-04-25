import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve locally uploaded images from /uploads/ without going through
    // Next.js image optimization — avoids cache invalidation issues on
    // deployment and means no pm2 restart is needed when new images are uploaded.
    remotePatterns: [],
    localPatterns: [
      {
        pathname: "/uploads/**",
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
