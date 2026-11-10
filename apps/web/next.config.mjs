import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // LAN / Cursor browser access for client hydration in dev
  allowedDevOrigins: ["192.168.1.133", "127.0.0.1", "localhost"],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "videos.pexels.com",
      },
      {
        protocol: "https",
        hostname: "pub-19c3bb11c2e84d748e4f08a3800f13ab.r2.dev",
      },
    ],
  },
  turbopack: {
    root: path.join(__dirname, "../.."),
    resolveAlias: {
      "next-intl/config": "./src/i18n/request.ts",
    },
  },
  webpack: (config) => {
    config.resolve.alias["next-intl/config"] = path.join(
      __dirname,
      "src/i18n/request.ts",
    );
    return config;
  },
};

export default nextConfig;
