"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import { PARROTS } from "./parrots";
import styles from "./LivingParrots.module.css";

type Img = { url: string; width: number; height: number; alt: string };

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/**
 * The whole work; then the camera moves in on the two parrots, which flutter gently on the spot,
 * and back out to the untouched painting. Runs once when it comes into view; can be replayed.
 * With reduced motion it is simply the still photograph.
 */
export function LivingParrots({ image, sizes }: { image: Img; sizes: string }) {
  const { t } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const running = useRef<Animation[]>([]);

  const play = useCallback(() => {
    const cam = camera.current;
    const el = root.current;
    if (!cam || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    running.current.forEach((a) => a.cancel());
    setPlaying(true);
    setDone(false);

    const { focus, width, height } = PARROTS;
    const zoomIn = 2600;
    const hold = 6500;
    const total = zoomIn * 2 + hold;
    const ease = "cubic-bezier(.45,0,.25,1)";
    const tx = 50 - (focus.x / width) * 100;
    const ty = 50 - (focus.y / height) * 100;
    const zoomed = `translate(${tx * focus.zoom}%, ${ty * focus.zoom}%) scale(${focus.zoom})`;

    const animations: Animation[] = [
      cam.animate(
        [
          { transform: "none", offset: 0, easing: ease },
          { transform: zoomed, offset: zoomIn / total },
          { transform: zoomed, offset: (zoomIn + hold) / total, easing: ease },
          { transform: "none", offset: 1 },
        ],
        { duration: total, fill: "forwards" },
      ),
    ];

    // Flutter while the camera is close: slow wing beats, a soft bob of the body.
    el.querySelectorAll<HTMLElement>("[data-bird]").forEach((bird, i) => {
      const cfg = PARROTS.birds[i];
      const wing = bird.querySelector<HTMLElement>("[data-wing]")!;
      const start = zoomIn * 0.55 + cfg.delay;
      const length = hold + zoomIn * 0.6 - cfg.delay;
      const beats = Math.max(1, Math.round(length / 1100));
      const beat = length / beats;
      const fadeIn = { duration: 500, fill: "both" as const };
      animations.push(
        wing.animate(
          [
            { transform: "rotate(0deg)" },
            { transform: `rotate(${cfg.beat}deg)` },
            { transform: `rotate(${-cfg.beat * 0.45}deg)` },
            { transform: "rotate(0deg)" },
          ],
          { duration: beat, iterations: beats, delay: start, easing: "ease-in-out" },
        ),
        bird.animate(
          [
            { transform: "translateY(0)" },
            { transform: "translateY(-1.4%)" },
            { transform: "translateY(0.4%)" },
            { transform: "translateY(0)" },
          ],
          { duration: beat, iterations: beats, delay: start + 120, easing: "ease-in-out" },
        ),
        bird.animate([{ opacity: 0 }, { opacity: 1 }], { ...fadeIn, delay: 0 }),
      );
    });

    running.current = animations;
    animations[0].finished
      .then(() => {
        setPlaying(false);
        setDone(true);
      })
      .catch(() => {});
  }, []);

  // Once, when the work is well in view.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          setTimeout(play, 900);
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      running.current.forEach((a) => a.cancel());
    };
  }, [play]);

  return (
    <div className={styles.root}>
      <div ref={root} className={styles.viewport} data-playing={playing || undefined}>
        <div ref={camera} className={styles.camera}>
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={sizes}
            quality={90}
            priority
            className={styles.photo}
          />
          {/* The moving version: clean plate + the birds, only shown while the animation runs. */}
          <div className={styles.living} aria-hidden="true">
            <Image
              src={PARROTS.plate}
              alt=""
              width={PARROTS.width}
              height={PARROTS.height}
              sizes={sizes}
              quality={90}
              className={styles.photo}
            />
            {PARROTS.birds.map((b) => (
              <div
                key={b.key}
                data-bird
                className={styles.bird}
                style={{
                  left: pct(b.box.x, PARROTS.width),
                  top: pct(b.box.y, PARROTS.height),
                  width: pct(b.box.w, PARROTS.width),
                  height: pct(b.box.h, PARROTS.height),
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.body} alt="" className={styles.part} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.wing}
                  alt=""
                  data-wing
                  className={styles.part}
                  style={{ transformOrigin: `${pct(b.pivot.x, b.box.w)} ${pct(b.pivot.y, b.box.h)}` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {done && (
        <button type="button" className={styles.replay} onClick={play}>
          ↻ {t.product.replay}
        </button>
      )}
    </div>
  );
}
