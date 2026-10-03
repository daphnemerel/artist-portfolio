import Link from "next/link";
import type { WorkSummary } from "@/lib/content";
import { Caption } from "./Caption";
import { FadeImage } from "./FadeImage";
import styles from "./plate.module.css";

export type PlateLayout = "large" | "small-left" | "medium" | "small-right";

/** Default rhythm of a sequence of works: large, small, medium, small. */
const rhythm: PlateLayout[] = ["large", "small-left", "medium", "small-right"];

const sizes: Record<PlateLayout, string> = {
  large: "(max-width: 700px) 100vw, 75vw",
  medium: "(max-width: 700px) 100vw, 42vw",
  "small-left": "(max-width: 700px) 75vw, 25vw",
  "small-right": "(max-width: 700px) 75vw, 25vw",
};

/** Placement for the n-th plate in a sequence; a work's own `size` overrides the rhythm. */
export function plateLayout(work: Pick<WorkSummary, "size">, index: number): PlateLayout {
  const auto = rhythm[index % rhythm.length];
  if (work.size === "large" || work.size === "medium") return work.size;
  if (work.size === "small") return auto === "small-right" ? "small-right" : "small-left";
  return auto;
}

/** One artwork placed in the sequence: image at its own proportions, caption beside or below it. */
export function Plate({
  work,
  layout,
  priority = false,
}: {
  work: WorkSummary;
  layout: PlateLayout;
  priority?: boolean;
}) {
  const image = work.images[0];
  return (
    <Link href={`/works/${work.slug}`} className={`${styles.plate} ${styles[layout]}`}>
      <span className={styles.media}>
        <FadeImage
          src={image.url}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes[layout]}
          quality={layout === "large" ? 90 : undefined}
          priority={priority}
          className={styles.image}
        />
      </span>
      <span className={styles.caption}>
        <Caption work={work} full />
      </span>
    </Link>
  );
}
