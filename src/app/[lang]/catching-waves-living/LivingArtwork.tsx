"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createLivingArtwork, type Picture } from "@/lib/living-artwork/engine";
import { catchingWavesLiving } from "./config";
import { format } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import styles from "./living.module.css";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  artwork: Picture;
  work: { slug: string; title: string; year?: number; medium: string; dimensions?: string; summary?: string };
};

export function LivingArtwork({ artwork, work }: Props) {
  const { t: dict, href } = useI18n();
  const t = dict.experimental;
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ?capture: no scroll control; a video renderer sets the position frame by frame
    // (no scroll smoothing, no timing noise). Has no effect on normal visits.
    const capture = new URLSearchParams(window.location.search).has("capture");
    const engine = createLivingArtwork(
      { root: root.current!, stage: stage.current!, camera: camera.current! },
      catchingWavesLiving(artwork),
      gsap,
      ScrollTrigger,
      { controlled: capture },
    );
    if (capture) {
      (window as unknown as { __livingArtwork?: typeof engine }).__livingArtwork = engine;
    }
    return () => engine.destroy();
  }, [artwork]);

  return (
    <section ref={root} className={styles.root} aria-label={format(t.livingLabel, { title: work.title })}>
      <div ref={stage} className={styles.stage}>
        <div ref={camera} className={styles.camera} />

        <div className={styles.caption} data-la-hint>
          <span>
            {work.title}
            {work.year ? `, ${work.year}` : ""}
          </span>
          <span className={styles.hintLine} aria-hidden="true" />
        </div>

        <div className={styles.info}>
          <p className={styles.eyebrow} data-la-info>
            {t.livingEyebrow}
          </p>
          <h1 className={styles.title} data-la-info>
            {work.title}
          </h1>
          <dl className={styles.meta} data-la-info>
            <dt className="visually-hidden">{t.artist}</dt>
            <dd>Daphne Merel{work.year ? `, ${work.year}` : ""}</dd>
            <dt className="visually-hidden">{dict.works.medium}</dt>
            <dd>{work.medium}</dd>
            {work.dimensions && (
              <>
                <dt className="visually-hidden">{dict.works.dimensions}</dt>
                <dd>{work.dimensions}</dd>
              </>
            )}
          </dl>
          <hr className={styles.rule} data-la-info />
          <p className={styles.note} data-la-info>
            {t.livingNote}
          </p>
          <p className={styles.links} data-la-info>
            <Link href={href(`/works/${work.slug}`)}>{t.viewWork}</Link>
            <Link href={href("/experimental")}>{t.all}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
