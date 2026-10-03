import type { Work } from "@/lib/content";
import styles from "./media.module.css";

type CaptionWork = Pick<Work, "title" | "year" | "medium" | "dimensions" | "edition">;

/** Gallery-style caption: Title, year / medium / dimensions / edition. */
export function Caption({ work, full = false }: { work: CaptionWork; full?: boolean }) {
  return (
    <div className={styles.caption}>
      <p>
        <cite className={styles.title}>{work.title}</cite>
        {work.year && <>, {work.year}</>}
      </p>
      {full && (
        <>
          <p>{work.medium}</p>
          {work.dimensions && <p>{work.dimensions}</p>}
          {work.edition && <p>{work.edition}</p>}
        </>
      )}
    </div>
  );
}
