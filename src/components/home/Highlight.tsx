import Image from "next/image";
import Link from "next/link";
import type { Site, Work } from "@/lib/content";
import styles from "./Highlight.module.css";

/** A current exhibition: the work on the left, a short note and a button beside it, on a pale pink band. */
export function Highlight({
  highlight,
  work,
}: {
  highlight: NonNullable<Site["highlight"]>;
  work: Work;
}) {
  const image = work.images[0];
  return (
    <section className={styles.band} aria-labelledby="highlight-title">
      <div className={styles.inner}>
        <Link
          href={`/works/${work.slug}`}
          className={styles.work}
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 700px) 100vw, 40vw"
            quality={90}
            className={styles.image}
          />
        </Link>
        <div className={styles.info}>
          <p className={styles.eyebrow}>{highlight.eyebrow}</p>
          <h2 id="highlight-title" className={styles.title}>
            {highlight.title}
          </h2>
          <span className={styles.rule} aria-hidden="true" />
          <p className={styles.text}>{highlight.text}</p>
          <Link href={highlight.link.href} className={styles.button}>
            {highlight.link.label} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
