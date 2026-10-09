import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OtherWorks } from "@/components/works/OtherWorks";
import { WorkJourney } from "@/components/works/WorkJourney";
import { WorkPurchase } from "@/components/works/WorkPurchase";
import { getSite, getWork, getWorks } from "@/lib/content";
import { CatchingWavesExperience } from "./CatchingWavesExperience";
import styles from "./preview.module.css";

/*
 * EXPERIMENTAL PREVIEW (V2, "Beyond the Canvas") — not linked from the site, not in the sitemap,
 * not indexed. The live work page /works/2026-catching-waves is unchanged.
 *
 * For this route only, the artist has explicitly approved deviating from the codebook's limits on
 * parallax, pinned scrolling and heavier animation (CLAUDE.md / DAPHNE_MEREL_DESIGN_CODEBOOK.md
 * §2 and §12). Colours, type, spacing and the artwork rules (real photos, uncropped and
 * unfiltered in the reveal) still apply.
 */

const SLUG = "2026-catching-waves";

export const metadata: Metadata = {
  title: "Catching Waves (preview)",
  robots: { index: false, follow: false },
};

export default function CatchingWavesPreviewPage() {
  const work = getWork(SLUG);
  if (!work) notFound();

  const pick = <T extends { url: string }>(list: T[] | undefined, file: string) => list?.find((i) => i.url.endsWith(`/${file}`));
  const artwork = work.images[0];
  const studioWide = pick(work.journey?.items, "journey-studio.jpg");
  const studioTall = pick(work.images, "02.jpg");
  if (!studioWide || !studioTall) {
    throw new Error("Catching Waves preview needs journey-studio.jpg and 02.jpg in the work's content folder");
  }
  const toImg = (i: { url: string; width: number; height: number; alt: string }) => ({
    url: i.url,
    width: i.width,
    height: i.height,
    alt: i.alt,
  });
  const site = getSite();
  const others = getWorks().filter((w) => w.slug !== work.slug).slice(0, 3);

  return (
    <article>
      <CatchingWavesExperience
        work={{
          title: work.title,
          year: work.year,
          medium: work.medium,
          dimensions: work.dimensions,
          summary: work.summary,
          price: work.price,
        }}
        email={site.email}
        artwork={toImg(artwork)}
        studioWide={toImg(studioWide)}
        studioTall={toImg(studioTall)}
      />

      {/* On large screens the scene ends with these details beside the work; elsewhere they follow here. */}
      <div id="details" tabIndex={-1} className={`${styles.details} container`}>
        <div className={styles.after}>
          <WorkPurchase work={work} email={site.email} />
        </div>
      </div>

      {/* The rest of the normal work page. */}
      <div className={`${styles.after} container`}>
        {work.journey && <WorkJourney journey={work.journey} />}
        <OtherWorks works={others} />
      </div>
    </article>
  );
}
