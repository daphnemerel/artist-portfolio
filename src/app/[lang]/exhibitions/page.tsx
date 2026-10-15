import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Highlight } from "@/components/home/Highlight";
import type { Dictionary } from "@/i18n/dictionaries";
import { alternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import {
  getExhibitions,
  getSite,
  getWork,
  type Exhibition,
} from "@/lib/content";
import type { Locale } from "@/i18n/config";
import styles from "./exhibitions.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: t.exhibitions.title,
    description: t.exhibitions.lead,
    ...alternates(locale, "/exhibitions"),
  };
}

/**
 * Exhibitions: the current exhibition in the pale pink band (as on the homepage), then
 * "Upcoming" and "Past" as CV-like rows (year | title, venue, text | small image | link).
 * The rows come from content/exhibitions.yaml; an empty list shows a quiet note.
 */
export default async function ExhibitionsPage() {
  const { locale, t, href } = await getI18n();
  const site = getSite(locale);
  const exhibitions = getExhibitions(locale);
  const upcoming = exhibitions.filter((e) => e.status === "upcoming").reverse(); // soonest first
  const past = exhibitions.filter((e) => e.status === "past"); // newest first
  const highlight = site.highlight;
  const highlightWork = highlight && getWork(highlight.work, locale);

  return (
    <div className={`${styles.page} container`} data-tight-footer="">
      <header className={styles.header}>
        <h1 className={styles.title}>{t.exhibitions.title}</h1>
      </header>

      {highlight && highlightWork && (
        <Highlight
          highlight={highlight}
          work={highlightWork}
          locale={locale}
          t={t}
          link={{
            label: t.exhibitions.viewWork,
            href: `/works/${highlightWork.slug}`,
          }}
        />
      )}

      <Section
        id="upcoming"
        title={t.exhibitions.upcomingTitle}
        text={t.exhibitions.upcomingText}
        empty={t.exhibitions.upcomingEmpty}
        items={upcoming}
        highlighted
        locale={locale}
        t={t}
        href={href}
      />
      <Section
        id="past"
        title={t.exhibitions.pastTitle}
        text={t.exhibitions.pastText}
        empty={t.exhibitions.pastEmpty}
        items={past}
        locale={locale}
        t={t}
        href={href}
      />
    </div>
  );
}

function Section({
  id,
  title,
  text,
  empty,
  items,
  highlighted,
  locale,
  t,
  href,
}: {
  id: string;
  title: string;
  text: string;
  empty: string;
  items: Exhibition[];
  highlighted?: boolean;
  locale: Locale;
  t: Dictionary;
  href: (path: string) => string;
}) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <p className={styles.eyebrow} aria-hidden="true">
        {title}
      </p>
      <h2 id={`${id}-title`} className={styles.heading}>
        {title}
      </h2>
      <p className={styles.intro}>{text}</p>

      {items.length === 0 ? (
        <p className={styles.empty}>{empty}</p>
      ) : (
        <ol className={styles.list}>
          {items.map((e) => {
            const work = e.works[0] ? getWork(e.works[0], locale) : undefined;
            if (e.works[0] && !work) {
              throw new Error(
                `content/exhibitions.yaml: "${e.works[0]}" is not a folder in content/works`,
              );
            }
            const image = work?.images[0];
            return (
              <li
                key={`${e.title}-${e.venue}-${e.year ?? ""}`}
                className={styles.row}
                data-highlighted={highlighted || undefined}
              >
                <p className={styles.when}>
                  <span className={styles.year}>
                    {e.year ?? t.exhibitions.yearToBeAdded}
                  </span>
                  {e.period && (
                    <span className={styles.period}>{e.period}</span>
                  )}
                </p>
                <div className={styles.body}>
                  <h3 className={styles.rowTitle}>{e.title}</h3>
                  <p className={styles.venue}>
                    {e.venue}, {e.city}
                  </p>
                  {e.text && <p className={styles.text}>{e.text}</p>}
                </div>
                {work && image ? (
                  <Link
                    href={href(`/works/${work.slug}`)}
                    className={styles.thumb}
                    aria-label={work.title}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      sizes="96px"
                      className={styles.thumbImage}
                    />
                  </Link>
                ) : (
                  <span className={styles.thumb} aria-hidden="true" />
                )}
                {e.url ? (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.more}
                  >
                    <span>{t.exhibitions.moreInfo}</span>{" "}
                    <span aria-hidden="true">↗</span>
                  </a>
                ) : work ? (
                  <Link
                    href={href(`/works/${work.slug}`)}
                    className={styles.more}
                  >
                    <span>{t.exhibitions.moreInfo}</span>{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <span />
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
