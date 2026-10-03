import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Artwork images are copied from content/ into public/media/ by scripts/sync-images.mjs
    localPatterns: [
      { pathname: "/media/**", search: "" },
      // Site photography (e.g. the studio photo) lives in public/images/.
      { pathname: "/images/**", search: "" },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
  },
};

export default nextConfig;
