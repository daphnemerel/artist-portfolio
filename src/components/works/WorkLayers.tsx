import Image from "next/image";
import type { WorkLayer } from "@/lib/content";
import styles from "./WorkLayers.module.css";

/**
 * Opening of a work page: the title beside a strip of tall panels that runs from close up out to
 * the studio; the first panel fades into the page behind the text. On phones one large panel
 * carries the title, with two small ones beside it (chosen per layer with `phone`). The full, uncropped work follows further down.
 */
export function WorkLayers({
  title,
  layers,
  isPageTitle = false,
}: {
  title: string;
  layers: WorkLayer[];
  /** Render the title as the page's h1 (when no other heading names the work). */
  isPageTitle?: boolean;
}) {
  const Heading = isPageTitle ? "h1" : "p";

  return (
    <section className={styles.layers} aria-label={`${title}: layers`}>
      <ul className={styles.strip}>
        {layers.map(({ image, zoom, focus, phone }, i) => (
          <li
            key={image.url + i}
            className={styles.panel}
            data-phone={phone ?? "hidden"}
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              // A zoomed panel shows a fraction of the image, so it needs a larger file.
              sizes={`(max-width: 900px) ${Math.round((phone === "main" ? 75 : 25) * zoom)}vw, ${Math.round(30 * zoom)}vw`}
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
        <Heading className={styles.heading}>
          {title.split(" ").map((word, i) => (
            <span key={i}>{word}</span>
          ))}
        </Heading>
        <hr className={styles.rule} />
        <p className={styles.text}>Scroll to move through the layers of {title}.</p>
        <a href="#about" className={styles.arrow} aria-label="Scroll to the work">
          ↓
        </a>
      </div>
    </section>
  );
}
