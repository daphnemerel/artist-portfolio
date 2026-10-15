import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { OtherWorks } from "@/components/works/OtherWorks";
import { LivingParrots } from "@/components/works/living/LivingParrots";
import { format } from "@/i18n/config";
import { alternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { getWork, getWorks, type Work } from "@/lib/content";
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

/** Works whose page opens with a short animation made from their own photograph. */
const LIVING: Record<string, typeof LivingParrots | undefined> = { "work-5": LivingParrots };

type Supporting = {
  url: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
};

/** Three real photos below the work: the "inside the work" photos where a work has them, otherwise its next images. */
function supportingImages(work: Work): Supporting[] {
  const journey = work.journey?.items;
  if (journey && journey.length >= 3) {
    const pick = [
      "Texture",
      "Studio",
      "Process",
      "Textuur",
      "Atelier",
      "Proces",
    ];
    const chosen = journey.filter((item) => pick.includes(item.label));
    return (chosen.length >= 3 ? chosen : journey)
      .slice(0, 3)
      .map((item) => ({ ...item, caption: item.label }));
  }
  return work.images.slice(1, 4);
}

/** Placeholder values in the content ("Medium to be added", "Materiaal volgt nog") look like the empty ones. */
const isPlaceholder = (value: string | number) =>
  /to be added|volgt nog/i.test(String(value));

const md = (text?: string) =>
  text ? marked.parse(text.trim(), { async: false }) : undefined;

/**
 * A work page set like a museum catalogue entry: breadcrumb and previous / next, the whole work
 * hung on a quiet wall beside its label and facts, three numbered texts, supporting photos as
 * numbered figures, and "See other works" at the bottom.
 * Images are always shown whole, at their own proportions.
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
  const supporting = supportingImages(work);
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
  const texts: [string, string | undefined][] = [
    [t.story, md(work.story)],
    [t.details, md(work.details)],
    [t.process, md(work.process)],
  ];

  return (
    <article className={`${styles.page} container`}>
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
            {LIVING[work.slug] ? (
              (() => {
                const Living = LIVING[work.slug]!;
                return <Living image={image} sizes="(max-width: 900px) 100vw, 58vw" />;
              })()
            ) : (
              <Image
                src={image.url}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(max-width: 900px) 100vw, 58vw"
                quality={90}
                priority
                className={styles.artworkImage}
              />
            )}
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
          <Link
            href={`${href("/contact")}?onderwerp=${subject}`}
            className={styles.cta}
          >
            {t.inquire} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* 2. Three short texts */}
      <section className={styles.texts}>
        {texts.map(([heading, html], i) => (
          <div key={heading} className={styles.textBlock}>
            <p className={styles.textNumber}>
              {String(i + 1).padStart(2, "0")}
            </p>
            <h2 className={styles.textHeading}>{heading}</h2>
            {html ? (
              <div
                className={styles.prose}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className={`${styles.prose} ${styles.pending}`}>
                {t.textToBeAdded}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* 3. Supporting photos, whole, each with a short caption */}
      {supporting.length > 0 && (
        <section className={styles.supporting} aria-label={t.images}>
          <ul className={styles.supportingList}>
            {supporting.map((img, i) => (
              <li key={img.url}>
                <figure className={styles.figure}>
                  <span className={styles.frame}>
                    <Image
                      src={img.url}
                      alt={img.alt}
                      width={img.width}
                      height={img.height}
                      sizes="(max-width: 700px) 100vw, 30vw"
                      quality={85}
                      className={styles.supportingImage}
                    />
                  </span>
                  <figcaption className={styles.caption}>
                    <span className={styles.figNumber}>Fig. {i + 1}</span>
                    {img.caption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

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
