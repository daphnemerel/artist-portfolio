import Image from "next/image";
import type { WorkJourney as Journey } from "@/lib/content";
import styles from "./WorkJourney.module.css";

/** "Inside the work": an eyebrow and title, then numbered images in a 3 + 2 editorial grid. */
export function WorkJourney({ journey }: { journey: Journey }) {
  return (
    <section className={styles.journey} id="about" aria-labelledby="journey-title">
      <p className={styles.eyebrow}>{journey.eyebrow}</p>
      <div className={styles.head}>
        <h2 id="journey-title" className={styles.title}>
          {journey.title}
        </h2>
        {journey.intro && <p className={styles.intro}>{journey.intro}</p>}
      </div>

      <ol className={styles.items}>
        {journey.items.map((item, i) => (
          <li key={item.url + i} className={styles.item}>
            <div className={styles.media}>
              <Image
                src={item.url}
                alt={item.alt}
                fill
                sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                quality={90}
                className={styles.image}
                style={{ objectPosition: item.focus }}
              />
            </div>
            <div className={styles.caption}>
              <p className={styles.number}>{String(i + 1).padStart(2, "0")}</p>
              <div className={styles.text}>
                <h3 className={styles.label}>{item.label}</h3>
                {item.text && <p>{item.text}</p>}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
