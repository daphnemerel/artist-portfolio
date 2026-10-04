import Image from "next/image";
import Link from "next/link";
import type { WorkSummary } from "@/lib/content";
import styles from "./OtherWorks.module.css";

/** Three other works, linking on to the full overview. */
export function OtherWorks({ works }: { works: WorkSummary[] }) {
  if (works.length === 0) return null;

  return (
    <section className={styles.other} aria-labelledby="other-title">
      <p className={styles.eyebrow}>Explore</p>
      <div className={styles.head}>
        <div>
          <h2 id="other-title" className={styles.title}>
            See other works
          </h2>
          <p className={styles.intro}>
            Discover more textured landscapes, miniature figures and stories in paint.
          </p>
        </div>
        <Link href="/works" className={styles.all} aria-label="All works">
          →
        </Link>
      </div>

      <ul className={styles.grid}>
        {works.map((work) => {
          const image = work.images[0];
          return (
            <li key={work.slug}>
              <Link href={`/works/${work.slug}`} className={styles.card}>
                <span className={styles.media}>
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 30vw"
                    className={styles.image}
                  />
                </span>
                <span className={styles.name}>{work.title}</span>
                <span className={styles.kind}>Original artwork</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
