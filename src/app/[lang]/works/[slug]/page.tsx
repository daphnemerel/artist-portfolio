import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OtherWorks } from "@/components/works/OtherWorks";
import { WorkSlideshow } from "@/components/works/WorkSlideshow";
import { format } from "@/i18n/config";
import { alternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { getWork, getWorks } from "@/lib/content";
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
    description:
      work.summary ?? [work.medium, work.dimensions].filter(Boolean).join(", "),
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

/** Placeholder values in the content ("Medium to be added", "Materiaal volgt nog") look like the empty ones. */
const isPlaceholder = (value: string | number) =>
  /to be added|volgt nog/i.test(String(value));

/**
 * A work page that fits one screen on desktop: a slideshow of all the work's photos (shuffled,
 * never cropped) beside its label, facts and enquiry button; "See other works" below.
 */
export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const { locale, t: dict, href } = await getI18n();
  const t = dict.product;
  const work = getWork(slug, locale);
  if (!work) notFound();

  const works = getWorks(locale);
  const index = works.findIndex((w) => w.slug === slug);
  const prev = works[index - 1];
  const next = works[index + 1];
  const related = works.filter((w) => w.slug !== slug).slice(0, 3);
  const image = work.images[0];
  const subject = encodeURIComponent(
    format(t.inquireSubject, { title: work.title }),
  );

  const facts: [string, string | number | undefined][] = [
    [t.year, work.year],
    [t.medium, work.medium],
    [t.dimensions, work.dimensions],
    [t.availability, work.availability],
    [t.price, work.price],
  ];

  return (
    <article className={`${styles.page} container`} data-tight-footer="">
      {/* 5. Navigation: breadcrumb left, previous / next right */}
      <nav className={styles.topnav} aria-label={t.breadcrumb}>
        <ol className={styles.crumbs}>
          <li>
            <Link href={href("/")}>{t.home}</Link>
          </li>
          <li>
            <Link href={href("/works")}>{t.works}</Link>
          </li>
          <li aria-current="page">{work.title}</li>
        </ol>
        <p className={styles.prevNext}>
          {prev ? (
            <Link href={href(`/works/${prev.slug}`)} rel="prev">
              <span aria-hidden="true">←</span> {t.previous}
            </Link>
          ) : (
            <span className={styles.disabled}>
              <span aria-hidden="true">←</span> {t.previous}
            </span>
          )}
          {next ? (
            <Link href={href(`/works/${next.slug}`)} rel="next">
              {t.next} <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <span className={styles.disabled}>
              {t.next} <span aria-hidden="true">→</span>
            </span>
          )}
        </p>
      </nav>

      {/* 1. The work, whole, beside its label */}
      <section className={styles.hero} aria-labelledby="work-title">
        <figure className={styles.artwork}>
          <span className={styles.wall}>
            <WorkSlideshow
              images={work.images
                .filter((i) => i.slideshow)
                .map(({ url, width, height, alt }) => ({
                  url,
                  width,
                  height,
                  alt,
                }))}
              sizes="(max-width: 900px) 100vw, 58vw"
            />
          </span>
          <figcaption className={styles.plate}>
            <span>{work.title}</span>
            <span>Daphne Merel{work.year ? `, ${work.year}` : ""}</span>
          </figcaption>
        </figure>

        <div className={styles.label}>
          <p className={styles.eyebrow}>{t.label}</p>
          <h1 id="work-title" className={styles.title}>
            {work.title}
          </h1>
          {work.summary && <p className={styles.summary}>{work.summary}</p>}
          <dl className={styles.facts}>
            {facts.map(([label, value]) => (
              <div key={label} className={styles.fact}>
                <dt>{label}</dt>
                <dd
                  className={
                    !value || isPlaceholder(value) ? styles.pending : undefined
                  }
                >
                  {value ?? t.toBeAdded}
                </dd>
              </div>
            ))}
          </dl>
          {work.available ? (
            <Link
              href={`${href("/contact")}?onderwerp=${subject}`}
              className={styles.cta}
            >
              {t.inquire} <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <span
              className={`${styles.cta} ${styles.ctaDisabled}`}
              aria-disabled="true"
            >
              {t.unavailable}
            </span>
          )}
        </div>
      </section>

      {/* 4. See other works, as on the earlier work pages */}
      <OtherWorks
        works={related}
        t={dict}
        href={href}
        className={styles.others}
      />
    </article>
  );
}
