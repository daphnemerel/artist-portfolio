import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite, getWork } from "@/lib/content";
import { CatchingWavesExperience } from "./CatchingWavesExperience";

/*
 * EXPERIMENTAL PREVIEW — not linked from the site, not in the sitemap, not indexed.
 *
 * For this route only, the artist has explicitly approved deviating from the codebook's limits on
 * parallax, pinned scrolling and heavier animation (CLAUDE.md / DAPHNE_MEREL_DESIGN_CODEBOOK.md
 * §2 and §12). Everything else on the site keeps following the codebook. Colours, type, spacing
 * and artwork rules (uncropped, unfiltered, real images only) still apply here.
 */

const SLUG = "2026-catching-waves";

export const metadata: Metadata = {
  title: "Catching Waves (preview)",
  robots: { index: false, follow: false },
};

export default function CatchingWavesPreviewPage() {
  const work = getWork(SLUG);
  if (!work) notFound();

  // Images come from the work's own content folder (content/works/2026-catching-waves/images).
  const artwork = work.images[0];
  const studioWide = work.journey?.items.find((item) => item.url.endsWith("/journey-studio.jpg"));
  const studioTall = work.images.find((image) => image.url.endsWith("/02.jpg"));
  if (!studioWide || !studioTall) {
    throw new Error("Catching Waves preview: studio images journey-studio.jpg and 02.jpg are required");
  }

  return (
    <CatchingWavesExperience
      work={{
        slug: work.slug,
        title: work.title,
        year: work.year,
        medium: work.medium,
        dimensions: work.dimensions,
        summary: work.summary,
        price: work.price,
        html: work.html,
      }}
      email={getSite().email}
      artwork={{ url: artwork.url, width: artwork.width, height: artwork.height, alt: artwork.alt }}
      studioWide={{
        url: studioWide.url,
        width: studioWide.width,
        height: studioWide.height,
        alt: studioWide.alt,
      }}
      studioTall={{
        url: studioTall.url,
        width: studioTall.width,
        height: studioTall.height,
        alt: studioTall.alt,
      }}
    />
  );
}
