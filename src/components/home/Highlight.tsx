import Image from "next/image";
import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import type { Site, Work } from "@/lib/content";
import styles from "./Highlight.module.css";

/** A current exhibition: a small work, a short note and a button, on a slim pale pink band. */
export function Highlight({
  highlight,
  work,
  locale,
}: {
  highlight: NonNullable<Site["highlight"]>;
  work: Work;
  locale: Locale;
}) {
  const image = work.images[0];
  return (
    <section className={styles.band} aria-labelledby="highlight-title">
      <div className={styles.inner}>
        <Link
          href={localePath(locale, `/works/${work.slug}`)}
          className={styles.work}
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw"
            quality={90}
            className={styles.image}
          />
        </Link>
        <div className={styles.info}>
          <p className={styles.eyebrow}>{highlight.eyebrow}</p>
          <h2 id="highlight-title" className={styles.title}>
            {highlight.title}
          </h2>
          <p className={styles.text}>{highlight.text}</p>
          <Link
            href={localePath(locale, highlight.link.href)}
            className={`${styles.button} ${styles.buttonInline}`}
          >
            {highlight.link.label} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <Link
          href={localePath(locale, highlight.link.href)}
          className={`${styles.button} ${styles.buttonSide}`}
          tabIndex={-1}
          aria-hidden="true"
        >
          {highlight.link.label} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
