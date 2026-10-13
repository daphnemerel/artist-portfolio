import Link from "next/link";
import type { WorkSummary } from "@/lib/content";
import { FadeImage } from "@/components/media/FadeImage";
import styles from "./WorkCard.module.css";

/**
 * A work in the overview grid: every tile is the same square, but the image is fitted inside it
 * at its own proportions — never cropped — like a print hung on a gallery wall.
 */
export function WorkCard({
  work,
  priority = false,
  label,
}: {
  work: WorkSummary;
  priority?: boolean;
  /** Replaces the title and hides the metadata (e.g. just a number on the homepage). */
  label?: string;
}) {
  const image = work.images[0];
  return (
    <Link href={`/works/${work.slug}`} className={styles.card}>
      <span className={styles.wall}>
        <span className={styles.frame}>
          <FadeImage
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 700px) 45vw, (max-width: 1100px) 30vw, 22vw"
            priority={priority}
            className={styles.image}
          />
        </span>
      </span>
      <span className={styles.title}>{label ?? work.title}</span>
      {label === undefined && (
        <span className={styles.meta}>{[work.year, work.medium].filter(Boolean).join(" · ")}</span>
      )}
    </Link>
  );
}
