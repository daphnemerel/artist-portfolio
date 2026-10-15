"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import styles from "./WorkSlideshow.module.css";

type Img = { url: string; width: number; height: number; alt: string };

const INTERVAL = 2000; // ms per photo

/**
 * All photos of one work, one at a time, softly cross-fading in their own order: 1, 2, 3 … and
 * back to 1, every two seconds. Every photo is shown whole, never cropped.
 * Pauses on hover/focus and when off screen; with reduced motion it only moves on request.
 */
export function WorkSlideshow({ images, sizes }: { images: Img[]; sizes: string }) {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const count = images.length;

  const currentRef = useRef(0);
  const show = useCallback((i: number) => {
    currentRef.current = i;
    setCurrent(i);
  }, []);

  // In order, and round again: 1 → 2 → … → last → 1.
  const next = useCallback(() => show((currentRef.current + 1) % count), [count, show]);

  const prev = useCallback(() => {
    show((currentRef.current - 1 + count) % count);
  }, [count, show]);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = count > 1 && !paused && !hovered && visible && !reduced;
  useEffect(() => {
    if (!running) return;
    const id = setTimeout(next, INTERVAL);
    return () => clearTimeout(id);
  }, [running, current, next]);

  if (count === 0) return null;

  return (
    <div
      ref={root}
      className={styles.root}
      role="region"
      aria-roledescription="carousel"
      aria-label={t.product.slideshow}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className={styles.stage}>
        {images.map((img, i) => (
          <Image
            key={img.url}
            src={img.url}
            alt={img.alt}
            width={img.width}
            height={img.height}
            sizes={sizes}
            quality={90}
            priority={i === 0}
            className={styles.slide}
            data-active={i === current || undefined}
            aria-hidden={i !== current}
          />
        ))}
      </div>

      {count > 1 && (
        <div className={styles.controls}>
          <button type="button" onClick={prev} aria-label={t.product.previousPhoto}>
            ←
          </button>
          <span className={styles.count} aria-live="polite">
            {String(current + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          <button type="button" onClick={next} aria-label={t.product.nextPhoto}>
            →
          </button>
          {!reduced && (
            <button
              type="button"
              className={styles.pause}
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
            >
              {paused ? t.product.play : t.product.pause}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
