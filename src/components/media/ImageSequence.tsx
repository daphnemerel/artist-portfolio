"use client";

import { useState } from "react";
import type { WorkImage } from "@/lib/content";
import { FadeImage } from "./FadeImage";
import { Lightbox } from "./Lightbox";
import styles from "./media.module.css";

/** Images of a single work, stacked vertically at natural proportions. Click to view full screen. */
export function ImageSequence({ images }: { images: WorkImage[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <ol className={styles.sequence}>
        {images.map((image, index) => (
          <li key={image.url}>
            <figure className={styles.figure}>
              <button
                type="button"
                className={styles.zoom}
                onClick={() => setOpen(index)}
                aria-label={`View full screen: ${image.alt}`}
              >
                <FadeImage
                  src={image.url}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  quality={90}
                  priority={index === 0}
                />
              </button>
              {(image.caption || image.credit) && (
                <figcaption className={styles.imageCaption}>
                  {image.caption}
                  {image.caption && image.credit && ". "}
                  {image.credit}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ol>
      {open !== null && (
        <Lightbox images={images} index={open} onChange={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
