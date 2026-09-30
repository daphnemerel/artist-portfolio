import Link from "next/link";
import type { WorkSummary } from "@/lib/content";
import { Caption } from "./Caption";
import { FadeImage } from "./FadeImage";
import styles from "./media.module.css";

export function ArtworkTile({ work, priority = false }: { work: WorkSummary; priority?: boolean }) {
  const image = work.images[0];
  return (
    <Link href={`/works/${work.slug}`} className={styles.tile}>
      <FadeImage
        src={image.url}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
      />
      <Caption work={work} />
    </Link>
  );
}
