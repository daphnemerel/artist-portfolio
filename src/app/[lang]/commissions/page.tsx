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
 * to a wide (2.05 : 1) frame around the canvas (`focus` = object-position), so the painting itself always
 * stays whole; only plain wall is left out.
 */
const EXAMPLES = [
  { slug: "2026-catching-waves", photo: "new-07.jpg", focus: "50% 51.5%" },
  { slug: "work-1", photo: "04.jpg", focus: "50% 39.5%" },
  { slug: "work-2", photo: "04.jpg", focus: "50% 51.5%" },
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

const Petals = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse
        key={a}
        cx="0"
        cy="-12"
        rx="7"
        ry="12"
        transform={`rotate(${a})`}
      />
    ))}
    <circle r="3.2" />
    <path d="M0-3.2v-6M2.4-2.2l3-4.6M-2.4-2.2l-3-4.6" />
  </g>
);

/** A line drawing of a flowering branch, drawn for this page. */
const Sprig = () => (
  <svg
    className={styles.sprig}
    viewBox="0 0 320 190"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* branches */}
    <path d="M4 188C52 160 104 128 146 100s92-56 160-74" />
    <path d="M118 118c-8-24-6-48 10-70" />
    <path d="M206 64c16 8 34 10 54 4" />
    <path d="M66 152c-4-16 0-30 10-42" />
    {/* leaves, each with a midrib */}
    <path d="M40 168c-18-2-30-12-34-28 16 0 28 10 34 28Z" />
    <path d="M40 168 12 144" />
    <path d="M92 136c-4-18 2-32 16-40 2 16-4 30-16 40Z" />
    <path d="M92 136 106 100" />
    <path d="M100 128c16-10 32-10 44 0-14 8-30 8-44 0Z" />
    <path d="M100 128h42" />
    <path d="M168 86c-2-16 6-28 20-32 0 14-6 26-20 32Z" />
    <path d="M168 86l18-30" />
    <path d="M182 80c14-4 26 0 34 10-12 2-24-2-34-10Z" />
    <path d="M182 80l32 9" />
    <path d="M76 110c-12-6-18-16-16-28 12 4 18 16 16 28Z" />
    <path d="M240 46c4-12 14-18 26-18-4 12-14 18-26 18Z" />
    {/* flowers and a bud */}
    <Petals x={128} y={42} />
    <Petals x={300} y={24} s={0.8} />
    <path d="M262 68c6-6 14-6 18 0-4 8-12 8-18 0Z" />
    <path d="M70 108c-4-6-2-12 4-14 3 6 1 11-4 14Z" />
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
      {/* 1–2. Opening and "made to measure"; the studio photo top right, fading out */}
      <div className={styles.top}>
        <div className={styles.heroPhoto}>
          <Image
            src="/images/commissions-studio.jpg"
            alt={t.photoAlt}
            fill
            sizes="(max-width: 900px) 100vw, 66vw"
            quality={90}
            priority
            className={styles.heroImage}
          />
        </div>

        <section className={styles.hero}>
          <div className={styles.heroText}>
            <h1 className={styles.title}>{t.title}</h1>
            <p className={styles.lead}>{t.lead}</p>
            <Link href={contact} className={styles.button}>
              {t.ask} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* 2. Made to measure, on a light panel over the photo: text left, three points right */}
        <section className={styles.intro}>
          <div className={styles.introText}>
            <h2 className={styles.heading}>
              {/* Two lines, broken after the comma, as in the reference. */}
              {t.introTitle.split(", ").map((part, i, all) => (
                <span key={part}>
                  {part}
                  {i < all.length - 1 && (
                    <>
                      ,<br />
                    </>
                  )}
                </span>
              ))}
            </h2>
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

      {/* 4. Possibilities: kinds of commission, each shown with one of Daphne's own works */}
      <section className={styles.options} aria-labelledby="options-title">
        <div className={styles.optionsText}>
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
                aria-label={`${t.optionKinds[i]}: ${work.title}`}
              >
                <span className={styles.optionPhoto}>
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 700px) 100vw, (max-width: 1100px) 33vw, 22vw"
                    quality={85}
                    className={styles.optionImage}
                    style={{ objectPosition: focus }}
                  />
                </span>
                <span className={styles.optionLabel}>
                  <span>{t.optionKinds[i]}</span>
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Invitation, with the drawn branch reaching up into the band above */}
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
