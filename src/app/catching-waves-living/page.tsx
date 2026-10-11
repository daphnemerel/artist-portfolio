import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWork } from "@/lib/content";
import { LivingArtwork } from "./LivingArtwork";

// Experiment 02 (see content/experiments.yaml). Not indexed, not in the sitemap.
export const metadata: Metadata = {
  title: "Catching Waves — living artwork (experiment)",
  robots: { index: false, follow: false },
};

export default function CatchingWavesLivingPage() {
  const work = getWork("2026-catching-waves");
  if (!work) notFound();
  const image = work.images[0];
  return (
    <LivingArtwork
      artwork={{ src: image.url, width: image.width, height: image.height, alt: image.alt }}
      work={{
        slug: work.slug,
        title: work.title,
        year: work.year,
        medium: work.medium,
        dimensions: work.dimensions,
        summary: work.summary,
      }}
    />
  );
}
