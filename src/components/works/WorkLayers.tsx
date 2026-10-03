import Image from "next/image";
import Link from "next/link";
import type { WorkLayer } from "@/lib/content";
import styles from "./WorkLayers.module.css";

/**
 * Opening of a work page: the title beside a strip of tall panels that runs from close up out to
 * the studio; the first panel fades into the page behind the text. On phones the labelled layers
 * become full-height numbered screens. The full, uncropped work follows further down.
 */
export function WorkLayers({ title, layers }: { title: string; layers: WorkLayer[] }) {
  const labelled = layers.filter((l) => l.label);
  const lastLabelled = labelled.at(-1);

  return (
    <section className={styles.layers} aria-label={`${title}: layers`}>
      <ul className={styles.strip}>
        {layers.map((layer, i) => {
          const { image, zoom, focus, label, caption, textOnImage } = layer;
          const number = label ? labelled.indexOf(layer) + 1 : undefined;
          return (
            <li
              key={image.url + i}
              className={[
                styles.panel,
                label ? styles.labelled : styles.unlabelled,
                textOnImage ? styles.onImage : styles.onPage,
              ].join(" ")}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className={styles.media}>
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  // A zoomed panel shows a fraction of the image, so it needs a larger file.
                  sizes={`(max-width: 900px) ${Math.round(100 * zoom)}vw, ${Math.round(30 * zoom)}vw`}
                  quality={90}
                  priority={i < 2}
                  className={styles.image}
                  style={{
                    objectPosition: focus,
                    ...(zoom > 1 && { transformOrigin: focus, transform: `scale(${zoom})` }),
                  }}
                />
              </div>

              {label && (
                <div className={styles.caption}>
                  <p className={styles.number}>{String(number).padStart(2, "0")}</p>
                  <p className={styles.label}>{label}</p>
                  {caption && <p className={styles.captionText}>{caption}</p>}
                  {layer === lastLabelled && (
                    <Link href="/works" className={`button ${styles.cta}`}>
                      See other works →
                    </Link>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className={styles.intro}>
        <p className={styles.heading}>
          {title.split(" ").map((word, i) => (
            <span key={i}>{word}</span>
          ))}
        </p>
        <hr className={styles.rule} />
        <p className={styles.text}>Scroll to move through the layers of {title}.</p>
        <a href="#about" className={styles.arrow} aria-label="Scroll to the work">
          ↓
        </a>
      </div>
    </section>
  );
}
