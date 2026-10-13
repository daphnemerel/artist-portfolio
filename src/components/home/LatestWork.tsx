import Image from "next/image";
import Link from "next/link";
import type { Work } from "@/lib/content";
import styles from "./LatestWork.module.css";

/**
 * The most recent work as a small editorial spread: the label, the work, and (if there is one)
 * a detail beside it, like a page in a catalogue.
 */
export function LatestWork({ work, artist }: { work: Work; artist: string }) {
  const [image, detail] = work.images;
  const href = `/works/${work.slug}`;

  return (
    <section className={styles.latest} aria-labelledby="latest-title">
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
        {work.summary && <p className={styles.summary}>{work.summary}</p>}
        <p className={styles.links}>
          <Link href={href}>View the work</Link>
          <Link href="/works">All works</Link>
        </p>
      </div>

      <Link href={href} className={styles.work} tabIndex={-1} aria-hidden="true">
        <Image
          src={image.url}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 700px) 62vw, 320px"
          quality={90}
          className={styles.image}
        />
      </Link>

      {detail && (
        <figure className={styles.detail}>
          <Image
            src={detail.url}
            alt={detail.alt}
            width={detail.width}
            height={detail.height}
            sizes="(max-width: 700px) 30vw, 160px"
            quality={90}
            className={styles.image}
          />
          <figcaption className={styles.caption}>Detail</figcaption>
        </figure>
      )}
    </section>
  );
}
