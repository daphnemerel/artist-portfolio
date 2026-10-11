"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createLivingArtwork, type Picture } from "@/lib/living-artwork/engine";
import { catchingWavesLiving } from "./config";
import styles from "./living.module.css";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  artwork: Picture;
  work: { slug: string; title: string; year?: number; medium: string; dimensions?: string; summary?: string };
};

export function LivingArtwork({ artwork, work }: Props) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const engine = createLivingArtwork(
      { root: root.current!, stage: stage.current!, camera: camera.current! },
      catchingWavesLiving(artwork),
      gsap,
      ScrollTrigger,
    );
    return () => engine.destroy();
  }, [artwork]);

  return (
    <section ref={root} className={styles.root} aria-label={`${work.title}: one surfer comes alive`}>
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
            Experiment 02 · Living artwork
          </p>
          <h1 className={styles.title} data-la-info>
            {work.title}
          </h1>
          <dl className={styles.meta} data-la-info>
            <dt className="visually-hidden">Artist</dt>
            <dd>Daphne Merel{work.year ? `, ${work.year}` : ""}</dd>
            <dt className="visually-hidden">Medium</dt>
            <dd>{work.medium}</dd>
            {work.dimensions && (
              <>
                <dt className="visually-hidden">Dimensions</dt>
                <dd>{work.dimensions}</dd>
              </>
            )}
          </dl>
          <hr className={styles.rule} data-la-info />
          <p className={styles.note} data-la-info>
            The painting stays as it is. Only one of its own surfers, cut from the photograph of the
            work, rides a short way down his stroke — then the painting returns untouched.
          </p>
          <p className={styles.links} data-la-info>
            <Link href={`/works/${work.slug}`}>View the work</Link>
            <Link href="/experimental">All experiments</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
