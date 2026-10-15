import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageSequence } from "@/components/media/ImageSequence";
import { Prose } from "@/components/type/Prose";
import { OtherWorks } from "@/components/works/OtherWorks";
import { WorkJourney } from "@/components/works/WorkJourney";
import { WorkPurchase } from "@/components/works/WorkPurchase";
import { WorkLayers } from "@/components/works/WorkLayers";
import { format } from "@/i18n/config";
import { alternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { getSite, getWork, getWorks } from "@/lib/content";
import styles from "./work.module.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getWorks("en").map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await getI18n();
  const { slug } = await params;
  const work = getWork(slug, locale);
  if (!work) return {};
  const image = work.images[0];
  const alt = alternates(locale, `/works/${slug}`);
  return {
    title: work.year ? `${work.title}, ${work.year}` : work.title,
    description: [work.medium, work.dimensions].filter(Boolean).join(", "),
    ...alt,
    openGraph: {
      ...alt.openGraph,
      images: [
        {
          url: image.url,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
    },
  };
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const { locale, t, href } = await getI18n();
  const work = getWork(slug, locale);
  if (!work) notFound();

  const works = getWorks(locale);
  const index = works.findIndex((w) => w.slug === slug);
  const prev = works[index - 1];
  const next = works[index + 1];

  const story = Boolean(work.layers?.length);

  return (
    <article
      className={`${styles.work} ${story ? styles.story : ""} container`}
    >
      {story && (
        <WorkLayers
          title={work.title}
          layers={work.layers!}
          isPageTitle={Boolean(work.journey)}
          t={t}
        />
      )}

      {/* With a journey section, that section replaces the text-and-images layout below. */}
      {work.journey && (
        <>
          <WorkJourney journey={work.journey} />
          <WorkPurchase work={work} email={getSite(locale).email} t={t} />
          <OtherWorks
            works={works.filter((w) => w.slug !== work.slug).slice(0, 3)}
            t={t}
            href={href}
          />
        </>
      )}

      {!work.journey && (
        <>
          <header className={styles.details} id="about">
            <h1 className={styles.title}>{work.title}</h1>
            <dl className={styles.meta}>
              {work.year && (
                <>
                  <dt className="visually-hidden">{t.works.year}</dt>
                  <dd>{work.year}</dd>
                </>
              )}
              <dt className="visually-hidden">{t.works.medium}</dt>
              <dd>{work.medium}</dd>
              {work.dimensions && (
                <>
                  <dt className="visually-hidden">{t.works.dimensions}</dt>
                  <dd>{work.dimensions}</dd>
                </>
              )}
              {work.edition && (
                <>
                  <dt className="visually-hidden">{t.works.edition}</dt>
                  <dd>{work.edition}</dd>
                </>
              )}
              {work.series && (
                <>
                  <dt className="visually-hidden">{t.works.series}</dt>
                  <dd>{format(t.works.fromSeries, { series: work.series })}</dd>
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

          <nav className={styles.pager} aria-label={t.works.moreWorks}>
            {prev ? (
              <Link href={href(`/works/${prev.slug}`)}>← {prev.title}</Link>
            ) : (
              <span />
            )}
            <Link href={href("/works")}>{t.works.index}</Link>
            {next ? (
              <Link href={href(`/works/${next.slug}`)}>{next.title} →</Link>
            ) : (
              <span />
            )}
          </nav>

          {/* At the very bottom of every work page: three other works. */}
          <OtherWorks
            works={works.filter((w) => w.slug !== work.slug).slice(0, 3)}
            t={t}
            href={href}
            className={styles.others}
          />
        </>
      )}
    </article>
  );
}
