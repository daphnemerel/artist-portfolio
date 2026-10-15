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

/** Works shown as small squares (Catching Waves is already in the studio photo). */
const EXAMPLES = ["work-1", "work-2", "work-4", "work-5"];

/**
 * Commissions — design B ("Atelier"), chosen by Daphne. One screen:
 * left, the studio photo from header to footer; right, title, lead, the three steps as rows
 * between hairlines, four earlier works as whole squares, and the button.
 * Texts in src/i18n/dictionaries.
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
      <figure className={styles.photo}>
        <Image
          src="/images/commissions-studio.jpg"
          alt={t.photoAlt}
          fill
          sizes="(max-width: 900px) 100vw, 46vw"
          quality={90}
          priority
          className={styles.photoImage}
        />
        <figcaption className={styles.caption}>{t.photoCaption}</figcaption>
      </figure>

      <section className={styles.text} aria-labelledby="commissions-title">
        <h1 id="commissions-title" className={styles.title}>
          {t.title}
        </h1>
        <p className={styles.lead}>{t.lead}</p>

        <h2 className="visually-hidden">{t.stepsLabel}</h2>
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

        <h2 className="visually-hidden">{t.examplesTitle}</h2>
        <ul className={styles.works}>
          {examples.map((work) => {
            const image = work.images[0];
            return (
              <li key={work.slug}>
                <Link
                  href={href(`/works/${work.slug}`)}
                  className={styles.work}
                >
                  <span className={styles.frame}>
                    <Image
                      src={image.url}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      sizes="10vw"
                      quality={85}
                      className={styles.workImage}
                    />
                  </span>
                  <span className={styles.workTitle}>{work.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className={styles.actions}>
          <Link href={contact} className={styles.button}>
            {t.ask} <span aria-hidden="true">→</span>
          </Link>
          <Link href={contact} className={styles.link}>
            {t.priceNote}
          </Link>
        </p>
      </section>
    </div>
  );
}
