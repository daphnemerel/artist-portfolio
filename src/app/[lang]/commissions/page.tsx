import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { WorkCard } from "@/components/works/WorkCard";
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

/** Works shown under "Possibilities" as an impression of the style (Daphne's own works). */
const EXAMPLES = ["2026-catching-waves", "work-5", "watercolour-house"];

const Icon = ({ children }: { children: ReactNode }) => (
  <span className={styles.icon} aria-hidden="true">
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  </span>
);
const icons = [
  // a canvas on an easel
  <>
    <rect x="5" y="4" width="14" height="11" />
    <path d="M9 15 7 21M15 15l2 6M12 15v4" />
  </>,
  // a brush
  <>
    <path d="M14.5 4.5 19.5 9.5 11 18l-5-5Z" />
    <path d="M6 13c-2 1-2.5 3-3 6 3-.5 5-1 6-3" />
  </>,
  // size
  <>
    <path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6" />
  </>,
];

/**
 * Commissions: what a commission is, how it works in three steps, a few works as an impression of
 * the style, and an invitation to get in touch. Texts in src/i18n/dictionaries (nl = draft).
 */
export default async function CommissionsPage() {
  const { locale, t: dict, href } = await getI18n();
  const t = dict.commissions;
  const contact = `${href("/contact")}?onderwerp=${encodeURIComponent(t.subject)}`;
  const examples = EXAMPLES.map((slug) => getWork(slug, locale)).filter(
    (w) => w !== undefined,
  );

  return (
    <div className={`${styles.page} container`} data-tight-footer="">
      {/* 1. Opening: title, lead and button beside a photo of Daphne at work */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.lead}>{t.lead}</p>
          <Link href={contact} className={styles.button}>
            {t.ask} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <Image
          src="/images/studio-landscape.jpg"
          alt={t.photoAlt}
          width={1672}
          height={941}
          sizes="(max-width: 900px) 100vw, 45vw"
          quality={90}
          priority
          className={styles.heroImage}
        />
      </section>

      {/* 2. Made to measure: text left, three points right */}
      <section className={styles.intro}>
        <div>
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

      {/* 3. How it works */}
      <section className={styles.steps} aria-label={t.stepsLabel}>
        <ol className={styles.stepList}>
          {t.steps.map((s, i) => (
            <li key={s.title} className={styles.step}>
              <span className={styles.stepNumber}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.featureText}>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. Possibilities: a few of Daphne's own works as an impression of the style */}
      <section className={styles.options} aria-labelledby="options-title">
        <div className={styles.optionsText}>
          <h2 id="options-title" className={styles.heading}>
            {t.optionsTitle}
          </h2>
          <p className={styles.text}>{t.optionsText}</p>
        </div>
        <ul className={styles.optionsList}>
          {examples.map((work) => (
            <li key={work.slug}>
              <WorkCard work={work} locale={locale} label={work.title} />
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Invitation */}
      <section className={styles.cta}>
        <div>
          <h2 className={styles.ctaTitle}>{t.ctaTitle}</h2>
          <p className={styles.featureText}>{t.ctaText}</p>
        </div>
        <Link href={contact} className={styles.button}>
          {t.ctaButton} <span aria-hidden="true">→</span>
        </Link>
      </section>
    </div>
  );
}
