"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./WorksCarousel.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * "Selected works": four works in view, the rest (max. 8 in total) to the right.
 * - arrows step one work at a time;
 * - scrolling down onto the strip holds it and moves it to the right (scroll-scrubbed, reversible);
 * - reduced motion / no JS: a plain horizontal scroll strip with snap points.
 */
export function WorksCarousel({
  items,
  title = "Selected works",
}: {
  items: { key: string; card: ReactNode }[];
  title?: string;
}) {
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const [index, setIndex] = useState(0);
  const [pages, setPages] = useState(0); // number of steps to the right

  const measure = () => {
    const t = track.current!;
    const first = t.children[0] as HTMLElement | undefined;
    const second = t.children[1] as HTMLElement | undefined;
    const step = first && second ? second.offsetLeft - first.offsetLeft : first?.offsetWidth ?? 1;
    const max = Math.max(0, t.scrollWidth - viewport.current!.clientWidth);
    return { step, max, steps: Math.round(max / step) };
  };

  useEffect(() => {
    const mm = gsap.matchMedia();
    const update = () => setPages(measure().steps);
    update();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const { max } = measure();
      if (max <= 0) return;
      viewport.current!.dataset.pinned = "true";
      const tween = gsap.to(track.current, {
        x: () => -measure().max,
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top 12%",
          end: () => `+=${measure().max * 1.2}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => setIndex(Math.round(self.progress * measure().steps)),
        },
      });
      st.current = tween.scrollTrigger ?? null;
      return () => {
        st.current = null;
        delete viewport.current?.dataset.pinned;
      };
    });

    // reduced motion: native horizontal scrolling; keep the arrows in sync
    const v = viewport.current!;
    const onScroll = () => {
      if (!st.current) setIndex(Math.round(v.scrollLeft / measure().step));
    };
    v.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      mm.revert();
      v.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  const go = (to: number) => {
    const { step, steps } = measure();
    const target = Math.max(0, Math.min(steps, to));
    const trigger = st.current;
    if (trigger) {
      const y = trigger.start + (steps ? target / steps : 0) * (trigger.end - trigger.start);
      // jump; the scrub (0.6 s) makes the strip glide there
      window.scrollTo({ top: Math.round(y), behavior: "auto" });
    } else {
      viewport.current!.scrollTo({ left: target * step, behavior: "smooth" });
    }
    setIndex(target);
  };

  return (
    <section ref={section} className={styles.works} aria-labelledby="works-title">
      <div className={styles.head}>
        <h2 id="works-title" className={styles.title}>
          {title}
        </h2>
        <div className={styles.controls}>
          {pages > 0 && (
            <>
              <button type="button" className={styles.arrow} onClick={() => go(index - 1)} disabled={index <= 0} aria-label="Previous works">
                ←
              </button>
              <button type="button" className={styles.arrow} onClick={() => go(index + 1)} disabled={index >= pages} aria-label="Next works">
                →
              </button>
            </>
          )}
          <Link href="/works" className={styles.more}>
            All works <span aria-hidden="true">→</span>
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
  );
}
