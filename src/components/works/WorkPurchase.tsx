import Image from "next/image";
import type { WorkSummary } from "@/lib/content";
import styles from "./WorkPurchase.module.css";

/** The whole work, uncropped, beside its title, summary, price and a way to buy it. */
export function WorkPurchase({ work, email }: { work: WorkSummary; email?: string }) {
  const image = work.images[0];
  const subject = encodeURIComponent(`${work.title}${work.year ? `, ${work.year}` : ""}`);

  return (
    <section className={styles.purchase} aria-labelledby="purchase-title">
      <div className={styles.media}>
        <Image
          src={image.url}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 900px) 100vw, 55vw"
          quality={90}
          className={styles.image}
        />
      </div>

      <div className={styles.details}>
        <p className={styles.eyebrow}>Original artwork</p>
        <h2 id="purchase-title" className={styles.title}>
          {work.title}
        </h2>
        {work.summary && <p className={styles.summary}>{work.summary}</p>}
        {work.price && <p className={styles.price}>{work.price}</p>}
        <hr className={styles.rule} />
        {email && (
          <a href={`mailto:${email}?subject=${subject}`} className={`button ${styles.buy}`}>
            Buy this work <span aria-hidden="true">→</span>
          </a>
        )}
        <a href="#about" className={styles.more}>
          More details
        </a>
      </div>
    </section>
  );
}
