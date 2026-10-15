import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
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

/**
 * Works shown under "Possibilities": Daphne's own works, each in a photo of it on the wall, with
 * the kind of commission it stands for (texts in the dictionary, same order). The photo is cut
 * to a 4 : 3 frame around the canvas (`focus` = object-position), so the painting itself always
 * stays whole; only plain wall is left out.
 */
const EXAMPLES = [
  { slug: "2026-catching-waves", photo: "new-07.jpg", focus: "50% 53%" },
  { slug: "work-1", photo: "04.jpg", focus: "50% 35%" },
  { slug: "work-2", photo: "04.jpg", focus: "50% 53%" },
];

const Icon = ({ children }: { children: ReactNode }) => (
  <span className={styles.icon} aria-hidden="true">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  </span>
);
const icons = [
  // a small flower
  <>
    <circle cx="12" cy="12" r="1.6" />
    <path d="M12 10.4c-1.6-2-1.6-4.4 0-6.4 1.6 2 1.6 4.4 0 6.4ZM12 13.6c1.6 2 1.6 4.4 0 6.4-1.6-2-1.6-4.4 0-6.4ZM10.4 12c-2 1.6-4.4 1.6-6.4 0 2-1.6 4.4-1.6 6.4 0ZM13.6 12c2-1.6 4.4-1.6 6.4 0-2 1.6-4.4 1.6-6.4 0Z" />
  </>,
  // a brush
  <>
    <path d="M19.5 4.5c-3 1.5-7 5.5-9 8.5l1.5 1.5c3-2 7-6 7.5-10Z" />
    <path d="M10.5 13c-2 .2-3.3 1.6-3.5 3.6-.1 1.2-.8 2.1-2.5 2.9 3.4.6 6.6-.4 7.5-5Z" />
  </>,
  // a frame and its size
  <>
    <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
    <path d="M9 9l-3-3M15 9l3-3M15 15l3 3M9 15l-3 3" />
  </>,
];

/**
 * Commissions: an opening band, what a commission is, how it works in three steps, a few of
 * Daphne's own works as an impression, and an invitation. Texts in src/i18n/dictionaries.
 */
export default async function CommissionsPage() {
  const { locale, t: dict, href } = await getI18n();
  const t = dict.commissions;
  const contact = `${href("/contact")}?onderwerp=${encodeURIComponent(t.subject)}`;
  const examples = EXAMPLES.flatMap(({ slug, photo, focus }) => {
    const work = getWork(slug, locale);
    const image =
      work?.images.find((i) => i.url.endsWith(`/${photo}`)) ?? work?.images[0];
    return work && image ? [{ work, image, focus }] : [];
  });

  return (
    <div className={`${styles.page} container`} data-tight-footer="">
      {/* 1. Opening: title, lead and button | one calm studio photo */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.lead}>{t.lead}</p>
          <Link href={contact} className={styles.button}>
            {t.ask} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className={styles.heroPhoto}>
          <Image
            src="/images/commissions-studio.jpg"
            alt={t.photoAlt}
            fill
            sizes="(max-width: 900px) 100vw, 46vw"
            quality={90}
            priority
            className={styles.heroImage}
          />
        </div>
      </section>

      {/* 2. Made to measure: text left, three points right, between hairlines */}
      <section className={styles.intro}>
        <div className={styles.introText}>
          <h2 className={styles.heading}>{t.introTitle}</h2>
          <p className={styles.text}>{t.introText}</p>
        </div>
        <ul className={styles.features}>
          {t.features.map((f, i) => (
            <li key={f.title} className={styles.feature}>
              <Icon>{icons[i]}</Icon>
              <div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureText}>{f.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. How it works: three steps on a pale band, joined by a hairline */}
      <section className={styles.steps} aria-labelledby="steps-title">
        <h2 id="steps-title" className={styles.label}>
          {t.stepsLabel}
        </h2>
        <ol className={styles.stepList}>
          {t.steps.map((s, i) => (
            <li key={s.title} className={styles.step}>
              <span className={styles.stepNumber}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepText}>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. Possibilities: kinds of commission, each shown with one of Daphne's own works */}
      <section className={styles.options} aria-labelledby="options-title">
        <div className={styles.optionsHead}>
          <h2 id="options-title" className={styles.heading}>
            {t.optionsTitle}
          </h2>
          <p className={styles.text}>{t.optionsText}</p>
        </div>
        <ul className={styles.optionsList}>
          {examples.map(({ work, image, focus }, i) => (
            <li key={work.slug}>
              <Link
                href={href(`/works/${work.slug}`)}
                className={styles.option}
              >
                <span className={styles.optionPhoto}>
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 700px) 100vw, 30vw"
                    quality={85}
                    className={styles.optionImage}
                    style={{ objectPosition: focus }}
                  />
                </span>
                <span className={styles.optionLabel}>
                  <span className={styles.optionText}>
                    <span className={styles.optionKind}>
                      {t.optionKinds[i]}
                    </span>
                    <span className={styles.optionWork}>{work.title}</span>
                  </span>
                  <span className={styles.optionArrow} aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Invitation */}
      <section className={styles.cta}>
        <div className={styles.ctaText}>
          <h2 className={styles.ctaTitle}>{t.ctaTitle}</h2>
          <p className={styles.ctaLine}>{t.ctaText}</p>
        </div>
        <Link href={contact} className={styles.button}>
          {t.ctaButton} <span aria-hidden="true">→</span>
        </Link>
      </section>
    </div>
  );
}
