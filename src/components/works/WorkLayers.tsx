import Image from "next/image";
import type { WorkLayer } from "@/lib/content";
import styles from "./WorkLayers.module.css";

/**
 * Opening of a work page: "Dive into the work". A strip of tall panels runs from close up out to
 * the studio; the first one fades into the page behind the text. The full, uncropped work follows
 * further down.
 */
export function WorkLayers({ title, layers }: { title: string; layers: WorkLayer[] }) {
  return (
    <section className={styles.layers} aria-label={`${title}: layers`}>
      <ul className={styles.strip}>
        {layers.map(({ image, zoom, focus }, i) => (
          <li key={image.url + i} className={styles.panel} style={{ animationDelay: `${i * 120}ms` }}>
            <Image
              src={image.url}
              alt={image.alt}
              fill
              // A zoomed panel shows a fraction of the image, so it needs a correspondingly larger file.
              sizes={`(max-width: 900px) ${Math.round(70 * zoom)}vw, ${Math.round(30 * zoom)}vw`}
              quality={90}
              priority
              className={styles.image}
              style={{
                objectPosition: focus,
                ...(zoom > 1 && { transformOrigin: focus, transform: `scale(${zoom})` }),
              }}
            />
          </li>
        ))}
      </ul>

      <div className={styles.intro}>
        <p className={styles.heading}>
          Dive
          <br />
          into
          <br />
          the work
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
