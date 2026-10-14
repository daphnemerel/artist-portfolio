import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getI18n } from "@/i18n/server";
import { getWork } from "@/lib/content";
import { LivingArtwork } from "./LivingArtwork";

// Experiment 02 (see content/experiments.yaml). Not indexed, not in the sitemap.
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.experimental.livingTitle, robots: { index: false, follow: false } };
}

export default async function CatchingWavesLivingPage() {
  const { locale } = await getI18n();
  const work = getWork("2026-catching-waves", locale);
  if (!work) notFound();
  const image = work.images.find((i) => i.url.endsWith("/01.jpg")) ?? work.images[0];
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
