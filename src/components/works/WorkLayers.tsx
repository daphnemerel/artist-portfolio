import Image from "next/image";
import type { WorkLayer } from "@/lib/content";
import styles from "./WorkLayers.module.css";

/**
 * Opening of a work page: "Dive into the work", with tall panels that move from a close detail
 * out to the whole work and the studio. The full, uncropped work follows further down the page.
 */
export function WorkLayers({ title, layers }: { title: string; layers: WorkLayer[] }) {
  return (
    <section className={styles.layers} aria-label={`${title}: details`}>
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

      <ul className={styles.panels}>
        {layers.map(({ image, zoom, focus }, i) => (
          <li key={i} className={styles.panel}>
            <Image
              src={image.url}
              alt={zoom > 1 ? `Detail of ${title}` : image.alt}
              fill
              // A zoomed panel shows a fraction of the image, so it needs a correspondingly larger file.
              sizes={`(max-width: 900px) ${Math.round(25 * zoom)}vw, ${Math.round(20 * zoom)}vw`}
              quality={90}
              priority
              className={styles.image}
              style={{ objectPosition: focus, transformOrigin: focus, transform: `scale(${zoom})` }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
