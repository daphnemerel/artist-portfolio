import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { WorkSummary } from "@/lib/content";
import styles from "./OtherWorks.module.css";

/** Three other works, linking on to the full overview. */
export function OtherWorks({
  works,
  t,
  href,
  className,
}: {
  /** Extra class, e.g. for the spacing on a plain work page. */
  className?: string;
  works: WorkSummary[];
  t: Dictionary;
  /** Keeps links in the current language. */
  href: (path: string) => string;
}) {
  if (works.length === 0) return null;

  return (
    <section
      className={`${styles.other} ${className ?? ""}`}
      aria-labelledby="other-title"
    >
      <p className={styles.eyebrow}>{t.works.explore}</p>
      <div className={styles.head}>
        <div>
          <h2 id="other-title" className={styles.title}>
            {t.works.otherTitle}
          </h2>
          <p className={styles.intro}>{t.works.otherIntro}</p>
        </div>
        <Link
          href={href("/works")}
          className={styles.all}
          aria-label={t.works.allWorks}
        >
          →
        </Link>
      </div>

      <ul className={styles.grid}>
        {works.map((work) => {
          const image = work.images[0];
          return (
            <li key={work.slug}>
              <Link href={href(`/works/${work.slug}`)} className={styles.card}>
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
                <span className={styles.kind}>{t.works.originalArtwork}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
