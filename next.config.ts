import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The watercolour house moved from the experiments to the works.
  async redirects() {
    return [{ source: "/:lang(nl|en)/watercolour-house", destination: "/:lang/works/watercolour-house", permanent: true }];
  },
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
