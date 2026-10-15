import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { alternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { getWork } from "@/lib/content";
import styles from "./commissions.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: t.commissions.title,
    description: t.commissions.lead,
    ...alternates(locale, "/commissions"),
  };
}

/** Works shown under "Made before" (Catching Waves is already in the studio photo). */
const EXAMPLES = ["work-1", "work-2", "work-5"];

/**
 * Commissions: one screen, laid out as a catalogue spread.
 * Left: title, lead, a label with the practical facts, the three steps and the button.
 * Right, on a pale pink band to the edge of the window: the studio photo, whole, with a
 * caption, and three earlier works, whole, as small squares. Texts in src/i18n/dictionaries.
 */
export default async function CommissionsPage() {
  const { locale, t: dict, href } = await getI18n();
  const t = dict.commissions;
  const contact = `${href("/contact")}?onderwerp=${encodeURIComponent(t.subject)}`;
  const examples = EXAMPLES.flatMap((slug) => {
    const work = getWork(slug, locale);
    return work ? [work] : [];
  });

  return (
    <div className={`${styles.page} container`} data-tight-footer="">
      <section className={styles.text} aria-labelledby="commissions-title">
        <h1 id="commissions-title" className={styles.title}>
          {t.title}
        </h1>
        <p className={styles.lead}>{t.lead}</p>

        {/* The practical facts, set like the label on a work page. */}
        <dl className={styles.facts} aria-label={t.factsLabel}>
          {t.facts.map((f) => (
            <div key={f.label} className={styles.fact}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>

        <h2 className={styles.stepsLabel}>{t.stepsLabel}</h2>
        <ol className={styles.steps}>
          {t.steps.map((s, i) => (
            <li key={s.title} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepText}>{s.text}</p>
            </li>
          ))}
        </ol>

        <p className={styles.actions}>
          <Link href={contact} className={styles.button}>
            {t.ask}
          </Link>
          <Link href={href("/works")} className={styles.link}>
            {t.allWorks}
          </Link>
        </p>
      </section>

      <aside className={styles.band} aria-label={t.examplesTitle}>
        <figure className={styles.studio}>
          <Image
            src="/images/commissions-studio.jpg"
            alt={t.photoAlt}
            width={1536}
            height={1024}
            sizes="(max-width: 900px) 100vw, 45vw"
            quality={90}
            priority
            className={styles.studioImage}
          />
          <figcaption className={styles.caption}>{t.photoCaption}</figcaption>
        </figure>

        <div className={styles.examples}>
          <h2 className={styles.examplesTitle}>{t.examplesTitle}</h2>
          <ul className={styles.exampleList}>
            {examples.map((work) => {
              const image = work.images[0];
              return (
                <li key={work.slug}>
                  <Link
                    href={href(`/works/${work.slug}`)}
                    className={styles.example}
                  >
                    <span className={styles.exampleFrame}>
                      <Image
                        src={image.url}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        sizes="12vw"
                        quality={85}
                        className={styles.exampleImage}
                      />
                    </span>
                    <span className={styles.exampleTitle}>{work.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}
