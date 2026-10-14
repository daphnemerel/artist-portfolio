"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./WorksCarousel.module.css";

/**
 * "Recent works": a horizontal strip, four works in view, the rest to the right.
 * - swipe with a finger (native scrolling) or drag with the mouse (click, hold and swipe);
 * - the arrows step one work at a time;
 * - the page itself scrolls normally; nothing is pinned or scroll-driven.
 */
export function WorksCarousel({
  items,
  title = "Selected works",
  after,
}: {
  items: { key: string; card: ReactNode }[];
  title?: string;
  /** Content shown directly under the strip. */
  after?: ReactNode;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [pages, setPages] = useState(0); // number of steps to the right

  const measure = () => {
    const t = track.current!;
    const first = t.children[0] as HTMLElement | undefined;
    const second = t.children[1] as HTMLElement | undefined;
    const step =
      first && second
        ? second.offsetLeft - first.offsetLeft
        : (first?.offsetWidth ?? 1);
    const max = Math.max(0, t.scrollWidth - viewport.current!.clientWidth);
    return { step, max, steps: Math.round(max / step) };
  };

  useEffect(() => {
    const v = viewport.current!;
    const update = () => setPages(measure().steps);
    const onScroll = () => setIndex(Math.round(v.scrollLeft / measure().step));
    update();

    // Mouse drag. Touch and trackpads already scroll the strip natively.
    let drag: { x: number; left: number; moved: boolean } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: v.scrollLeft, moved: false };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        v.dataset.dragging = "true";
        v.setPointerCapture(e.pointerId);
      }
      e.preventDefault();
      v.scrollLeft = drag.left - dx;
    };
    const onUp = (e: PointerEvent) => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      if (v.hasPointerCapture(e.pointerId))
        v.releasePointerCapture(e.pointerId);
      if (!moved) return;
      // A drag is not a click: don't open the work under the mouse.
      const stop = (ev: Event) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      v.addEventListener("click", stop, { capture: true, once: true });
      setTimeout(
        () => v.removeEventListener("click", stop, { capture: true }),
        0,
      );
      // Settle on the nearest work, then hand back to scroll snapping.
      const { step } = measure();
      v.scrollTo({
        left: Math.round(v.scrollLeft / step) * step,
        behavior: "smooth",
      });
      setTimeout(() => delete v.dataset.dragging, 400);
    };
    const noImageDrag = (e: DragEvent) => e.preventDefault();

    v.addEventListener("scroll", onScroll, { passive: true });
    v.addEventListener("pointerdown", onDown);
    v.addEventListener("pointermove", onMove);
    v.addEventListener("pointerup", onUp);
    v.addEventListener("pointercancel", onUp);
    v.addEventListener("dragstart", noImageDrag);
    window.addEventListener("resize", update);
    return () => {
      v.removeEventListener("scroll", onScroll);
      v.removeEventListener("pointerdown", onDown);
      v.removeEventListener("pointermove", onMove);
      v.removeEventListener("pointerup", onUp);
      v.removeEventListener("pointercancel", onUp);
      v.removeEventListener("dragstart", noImageDrag);
      window.removeEventListener("resize", update);
    };
  }, []);

  const go = (to: number) => {
    const { step, steps } = measure();
    const target = Math.max(0, Math.min(steps, to));
    viewport.current!.scrollTo({ left: target * step, behavior: "smooth" });
    setIndex(target);
  };

  return (
    <div className={styles.pinned}>
      <section className={styles.works} aria-labelledby="works-title">
        <div className={styles.head}>
          <h2 id="works-title" className={styles.title}>
            {title}
          </h2>
          <div className={styles.controls}>
            {pages > 0 && (
              <>
                <button
                  type="button"
                  className={styles.arrow}
                  onClick={() => go(index - 1)}
                  disabled={index <= 0}
                  aria-label="Previous works"
                >
                  ←
                </button>
                <button
                  type="button"
                  className={styles.arrow}
                  onClick={() => go(index + 1)}
                  disabled={index >= pages}
                  aria-label="Next works"
                >
                  →
                </button>
              </>
            )}
            <Link href="/works" className={styles.more}>
              View works
            </Link>
          </div>
        </div>
        <div ref={viewport} className={styles.viewport}>
          <ul ref={track} className={styles.track}>
            {items.map((item) => (
              <li key={item.key} className={styles.item}>
                {item.card}
              </li>
            ))}
          </ul>
        </div>
      </section>
      {after}
    </div>
  );
}
