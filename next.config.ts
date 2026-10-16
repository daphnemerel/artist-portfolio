import type { NextConfig } from "next";

/*
 * Basic security headers, safe for this site. A strict Content-Security-Policy is deliberately not
 * set yet (it could block the Google map); frame-ancestors only stops other sites from framing us.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework in every response.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
