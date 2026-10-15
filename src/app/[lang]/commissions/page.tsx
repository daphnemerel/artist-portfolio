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
 * Works shown under "Possibilities": Daphne's own works, each in a photo of it on the wall.
 * The photo is cut to a wide frame around the canvas (`focus` = object-position), so the
 * painting itself always stays whole; only plain wall is left out.
 */
const EXAMPLES = [
  { slug: "work-1", photo: "04.jpg", focus: "50% 39%" },
  { slug: "2026-catching-waves", photo: "new-07.jpg", focus: "50% 52%" },
  { slug: "work-2", photo: "04.jpg", focus: "50% 52%" },
];

const Icon = ({ children }: { children: ReactNode }) => (
  <span className={styles.icon} aria-hidden="true">
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
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

/** A simple line drawing of a sprig, drawn for this page. */
const Sprig = () => (
  <svg
    className={styles.sprig}
    viewBox="0 0 320 90"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 72C70 64 150 50 230 34c30-6 56-12 84-20" />
    <path d="M60 64c-4-14 2-26 16-32-2 14-6 25-16 32Z" />
    <path d="M70 62c10-8 24-8 34-2-12 6-23 7-34 2Z" />
    <path d="M120 54c-2-16 6-28 20-32 0 14-6 26-20 32Z" />
    <path d="M132 52c12-6 26-4 34 4-12 3-24 2-34-4Z" />
    <path d="M182 44c0-15 8-25 22-28-2 13-9 23-22 28Z" />
    <path d="M196 41c11-4 23-1 30 7-11 2-22 0-30-7Z" />
    <path d="M250 29c4-10 13-15 23-14-4 9-12 14-23 14Z" />
    <circle cx="300" cy="14" r="7" />
    <circle cx="300" cy="14" r="2.5" />
    <path d="M293 10c-3-5-1-10 4-11M307 18c4 3 9 2 11-2" />
  </svg>
);

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
      {/* 1–2. Opening and "made to measure", with the studio photo top right, fading out */}
      <div className={styles.top}>
        <section className={styles.hero}>
        <div className={styles.heroPhoto}>
          <Image
            src="/images/studio-landscape.jpg"
            alt={t.photoAlt}
            fill
            sizes="(max-width: 900px) 100vw, 64vw"
            quality={90}
            priority
            className={styles.heroImage}
          />
        </div>
          <div className={styles.heroText}>
            <h1 className={styles.title}>{t.title}</h1>
            <p className={styles.lead}>{t.lead}</p>
            <Link href={contact} className={styles.button}>
              {t.ask} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* 2. Made to measure: text left, three points right */}
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
      </div>

      {/* 3. How it works: three steps joined by a hairline */}
      <section className={styles.steps} aria-label={t.stepsLabel}>
        <ol className={styles.stepList}>
          {t.steps.map((s, i) => (
            <li key={s.title} className={styles.step}>
              <span className={styles.stepNumber}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={styles.stepBody}>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.featureText}>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. Possibilities: a few of Daphne's own works, on the wall */}
      <section className={styles.options} aria-labelledby="options-title">
        <div className={styles.optionsText}>
          <h2 id="options-title" className={styles.heading}>
            {t.optionsTitle}
          </h2>
          <p className={styles.text}>{t.optionsText}</p>
        </div>
        <ul className={styles.optionsList}>
          {examples.map(({ work, image, focus }) => (
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
                    sizes="(max-width: 700px) 100vw, (max-width: 1100px) 33vw, 24vw"
                    quality={85}
                    className={styles.optionImage}
                    style={{ objectPosition: focus }}
                  />
                </span>
                <span className={styles.optionLabel}>
                  <span>{work.title}</span>
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Invitation */}
      <section className={styles.cta}>
        <Sprig />
        <div className={styles.ctaText}>
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
