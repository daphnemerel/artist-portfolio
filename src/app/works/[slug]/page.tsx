import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageSequence } from "@/components/media/ImageSequence";
import { Prose } from "@/components/type/Prose";
import { WorkJourney } from "@/components/works/WorkJourney";
import { WorkLayers } from "@/components/works/WorkLayers";
import { getWork, getWorks } from "@/lib/content";
import styles from "./work.module.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getWorks().map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const work = getWork((await params).slug);
  if (!work) return {};
  const image = work.images[0];
  return {
    title: work.year ? `${work.title}, ${work.year}` : work.title,
    description: [work.medium, work.dimensions].filter(Boolean).join(", "),
    openGraph: { images: [{ url: image.url, width: image.width, height: image.height, alt: image.alt }] },
  };
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();

  const works = getWorks();
  const index = works.findIndex((w) => w.slug === slug);
  const prev = works[index - 1];
  const next = works[index + 1];

  const story = Boolean(work.layers?.length);

  return (
    <article className={`${styles.work} ${story ? styles.story : ""} container`}>
      {story && (
        <WorkLayers title={work.title} layers={work.layers!} isPageTitle={Boolean(work.journey)} />
      )}

      {/* With a journey section, that section replaces the text-and-images layout below. */}
      {work.journey && <WorkJourney journey={work.journey} />}

      {!work.journey && (
        <>
          <header className={styles.details} id="about">
            <h1 className={styles.title}>{work.title}</h1>
            <dl className={styles.meta}>
              {work.year && (
                <>
                  <dt className="visually-hidden">Year</dt>
                  <dd>{work.year}</dd>
                </>
              )}
              <dt className="visually-hidden">Medium</dt>
              <dd>{work.medium}</dd>
              {work.dimensions && (
                <>
                  <dt className="visually-hidden">Dimensions</dt>
                  <dd>{work.dimensions}</dd>
                </>
              )}
              {work.edition && (
                <>
                  <dt className="visually-hidden">Edition</dt>
                  <dd>{work.edition}</dd>
                </>
              )}
              {work.series && (
                <>
                  <dt className="visually-hidden">Series</dt>
                  <dd>From the series {work.series}</dd>
                </>
              )}
            </dl>
            {!story && <Prose html={work.html} />}
          </header>

          {/* Story layout: the text (What / How / Inspiration) gets its own columns next to the title. */}
          {story && (
            <div className={styles.about}>
              <Prose html={work.html} />
            </div>
          )}

          <div className={styles.images}>
            <ImageSequence images={work.images} />
          </div>

          <nav className={styles.pager} aria-label="More works">
            {prev ? (
              <Link href={`/works/${prev.slug}`}>← {prev.title}</Link>
            ) : (
              <span />
            )}
            <Link href="/works">Index</Link>
            {next ? <Link href={`/works/${next.slug}`}>{next.title} →</Link> : <span />}
          </nav>
        </>
      )}
    </article>
  );
}
