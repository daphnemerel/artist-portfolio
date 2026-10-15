import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The watercolour house moved from the experiments to the works.
  async redirects() {
    return [
      { source: "/:lang(nl|en)/watercolour-house", destination: "/:lang/works/watercolour-house", permanent: true },
      // The Experimental page and its studies were removed (Oct 2026); old links go to the homepage.
      ...["experimental", "catching-waves-preview", "catching-waves-living", "home-concept-red-car", "home-concept-studio"].map(
        (page) => ({ source: `/:lang(nl|en)/${page}`, destination: "/:lang", permanent: false }),
      ),
    ];
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
