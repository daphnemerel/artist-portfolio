"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { WorkImage } from "@/lib/content";
import styles from "./media.module.css";

type Props = {
  images: WorkImage[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
};

export function Lightbox({ images, index, onChange, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const image = images[index];
  const count = images.length;

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") onChange((index + 1) % count);
      if (event.key === "ArrowLeft") onChange((index - 1 + count) % count);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, count, onChange]);

  return (
    <dialog ref={dialogRef} className={styles.lightbox} onClose={onClose} aria-label="Image viewer">
      <div className={styles.lightboxBar}>
        <span>
          {index + 1} / {count}
        </span>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <button
        type="button"
        className={styles.lightboxStage}
        onClick={() => onChange((index + 1) % count)}
        aria-label={count > 1 ? "Next image" : "Image"}
      >
        <Image
          key={image.url}
          src={image.url}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="100vw"
          quality={90}
          loading="eager"
          className={styles.lightboxImage}
        />
      </button>
      {count > 1 && (
        <div className={styles.lightboxBar}>
          <button type="button" onClick={() => onChange((index - 1 + count) % count)}>
            Previous
          </button>
          <button type="button" onClick={() => onChange((index + 1) % count)}>
            Next
          </button>
        </div>
      )}
    </dialog>
  );
}
