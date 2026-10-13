import Image from "next/image";
import Link from "next/link";
import type { Work } from "@/lib/content";
import styles from "./LatestWork.module.css";

/** The most recent work, shown larger than the others: the work on the left, its label beside it. */
export function LatestWork({ work, artist }: { work: Work; artist: string }) {
  const [image, detail] = work.images;
  const href = `/works/${work.slug}`;

  return (
    <section className={styles.latest} aria-labelledby="latest-title">
      <Link href={href} className={styles.figure} tabIndex={-1} aria-hidden="true">
        <Image
          src={image.url}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 700px) 85vw, 440px"
          quality={90}
          className={styles.image}
        />
      </Link>

      <div className={styles.info}>
        <p className={styles.eyebrow}>Latest work</p>
        <h2 id="latest-title" className={styles.title}>
          <Link href={href}>{work.title}</Link>
        </h2>
        <p className={styles.meta}>
          <span>
            {artist}
            {work.year ? `, ${work.year}` : ""}
          </span>
          <span>{work.medium}</span>
          {work.dimensions && <span>{work.dimensions}</span>}
        </p>
        <span className={styles.rule} aria-hidden="true" />
        {work.summary && <p className={styles.summary}>{work.summary}</p>}
        <p className={styles.links}>
          <Link href={href}>View the work</Link>
          <Link href="/works">All works</Link>
        </p>
      </div>

      {detail && (
        <figure className={styles.detail}>
          <Image
            src={detail.url}
            alt={detail.alt}
            width={detail.width}
            height={detail.height}
            sizes="240px"
            quality={90}
            className={styles.image}
          />
          <figcaption className={styles.caption}>Detail</figcaption>
        </figure>
      )}
    </section>
  );
}
