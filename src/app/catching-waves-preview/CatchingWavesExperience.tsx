"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  applyH,
  buildRide,
  clamp,
  homography,
  lerp,
  lerpPt,
  lerpQuad,
  matrix3d,
  smoothstep,
  tiltedRect,
  type Pt,
} from "./geometry";
import { CAMERA, CLEANPLATE, MEASURED_ON, RIDE, SURFER, WORLDS, type World } from "./scene";
import styles from "./preview.module.css";

gsap.registerPlugin(ScrollTrigger);

type Img = { url: string; width: number; height: number; alt: string };

type Props = {
  work: {
    title: string;
    year?: number;
    medium: string;
    dimensions?: string;
    summary?: string;
    price?: string;
  };
  email?: string;
  artwork: Img;
  studioWide: Img;
  studioTall: Img;
};

/* Media queries shared with preview.module.css — keep them identical. */
const MOTION = "(prefers-reduced-motion: no-preference)";
const WIDE = "(min-aspect-ratio: 1/1)";
const INFO_BESIDE = "(min-aspect-ratio: 1/1) and (min-width: 900px)";

const ride = buildRide(RIDE);
const HOME = { u: RIDE[0][0], v: RIDE[0][1] };
const logLerp = (a: number, b: number, t: number) => Math.exp(lerp(Math.log(a), Math.log(b), t));

/**
 * Catching Waves — Beyond the Canvas (experimental preview).
 *
 * One camera moves through one world: the studio photo, with the real artwork photo laid onto the
 * canvas in perspective (a homography) and the artist's arm in front of it. The camera pushes in,
 * the canvas turns to face it, the camera dives into the paint, follows one of the work's own
 * surfers along his stroke and back, and pulls back to the whole, uncropped work.
 * Everything is scrubbed by scroll, so it plays backwards too.
 */
export function CatchingWavesExperience({ work, email, artwork, studioWide, studioTall }: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const subject = encodeURIComponent(`${work.title}${work.year ? `, ${work.year}` : ""}`);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add({ motion: MOTION, wide: WIDE, beside: INFO_BESIDE }, (ctx) => {
      const { motion, wide, beside } = ctx.conditions as Record<string, boolean>;
      if (!motion) return;

      const vp = viewport.current!;
      const world: World = WORLDS[wide ? "wide" : "tall"];
      const cam = CAMERA[world.key];
      const q = <T extends HTMLElement>(sel: string) => vp.querySelector<T>(`[data-world="${world.key}"] ${sel}`)!;
      const worldEl = vp.querySelector<HTMLElement>(`[data-world="${world.key}"]`)!;
      const studioEl = q<HTMLElement>("[data-studio]");
      const frontEl = q<HTMLElement>("[data-front]");
      const planeEl = q<HTMLElement>("[data-plane]");
      const plateEl = q<HTMLElement>("[data-plate]");
      const surferEl = q<HTMLElement>("[data-surfer]");
      const shadowEl = q<HTMLElement>("[data-surfer-shadow]");
      const label = vp.querySelector<HTMLElement>("[data-label]")!;
      const info = vp.querySelector<HTMLElement>(beside ? "[data-info]" : "[data-reveal-label]")!;

      const aw = artwork.width;
      const ah = artwork.height;
      const aspect = aw / ah;
      const unit = aw / MEASURED_ON; // artwork px per measured px

      // Canvas in the studio photo: centre and size of the flat (face-on) artwork in world px.
      const Q = world.canvas;
      const Qc: Pt = { x: (Q[0].x + Q[1].x + Q[2].x + Q[3].x) / 4, y: (Q[0].y + Q[1].y + Q[2].y + Q[3].y) / 4 };
      const Qh = (Math.hypot(Q[3].x - Q[0].x, Q[3].y - Q[0].y) + Math.hypot(Q[2].x - Q[1].x, Q[2].y - Q[1].y)) / 2;
      const Qw = (Math.hypot(Q[1].x - Q[0].x, Q[1].y - Q[0].y) + Math.hypot(Q[2].x - Q[3].x, Q[2].y - Q[3].y)) / 2;
      const Fh = Qh; // flat artwork height in world px
      const Fw = Fh * aspect;

      // Everything the timeline animates. render() turns it into transforms.
      const s = {
        ambient: 0, // a very light push when the page opens
        push: 0, // slow start towards the easel
        approach: 0, // canvas fills the frame
        flat: 0, // canvas turns to face the camera
        deep: 0, // dive into the paint, onto the surfer
        studio: 1, // studio photo + arm visible
        tilt: 0, // the paint plane leans back (2.5D)
        roll: 0, // camera roll in degrees
        ride: 0, // surfer along his loop
        follow: 0, // camera follows the surfer
        breathe: 0, // slight zoom breathing during the ride
        reveal: 0, // back to the whole work
      };

      surferEl.style.width = `${SURFER.box.width * unit}px`;
      surferEl.style.height = `${SURFER.box.height * unit}px`;
      plateEl.style.left = `${CLEANPLATE.box.x * unit}px`;
      plateEl.style.top = `${CLEANPLATE.box.y * unit}px`;
      plateEl.style.width = `${CLEANPLATE.box.width * unit}px`;
      plateEl.style.height = `${CLEANPLATE.box.height * unit}px`;

      const render = () => {
        const W = vp.clientWidth;
        const H = vp.clientHeight;
        const margin = Math.max(20, W * 0.06);
        const k = Math.max(W / world.width, H / world.height); // studio photo cover-fit

        /* The artwork plane: from the canvas in the photo to face-on, leaning back a little. */
        const flatQuad = tiltedRect(Qc, Fw, Fh, cam.tilt * s.tilt, cam.tilt * 0.3 * s.tilt);
        const quad = lerpQuad(Q, flatQuad, s.flat);
        const Hm = homography(aw, ah, quad);

        const r = ride(s.ride);
        const surferW = applyH(Hm, r.u * aw, r.v * ah);
        const homeW = applyH(Hm, HOME.u * aw, HOME.v * ah);
        const lag = ride(Math.max(0, s.ride - 0.035));
        const lagW = applyH(Hm, lag.u * aw, lag.v * ah);

        /* Zoom (multiplier on cover-fit), interpolated in log space so every step feels even. */
        const zCanvas = (0.95 * Math.min(H / Qh, W / Qw)) / k;
        const zDeep = (cam.dive * Math.max(W, H)) / (Fh * k);
        const revealPx = beside ? Math.min(H * 0.76, W * 0.5) : Math.min(W - 2 * margin, H * 0.6);
        const zReveal = revealPx / (Fh * k);
        vp.style.setProperty("--info-left", `${margin + revealPx * aspect + 64}px`);
        vp.style.setProperty("--reveal-bottom", `${H * 0.42 + revealPx / 2}px`);
        let z = 1 + 0.025 * s.ambient;
        z = logLerp(z, 1.35, s.push);
        z = logLerp(z, zCanvas, s.approach);
        z = logLerp(z, zDeep, s.deep) * (1 + 0.07 * s.breathe);
        z = logLerp(z, zReveal, s.reveal);
        const scale = k * z;

        /* Where the camera looks (world px). */
        let f: Pt = { x: world.width / 2, y: world.height / 2 };
        f = lerpPt(f, Qc, s.push * 0.3);
        f = lerpPt(f, Qc, s.approach);
        f = lerpPt(f, homeW, s.deep);
        f = lerpPt(f, lagW, s.follow);
        const target = beside ? { x: margin + (revealPx * aspect) / 2, y: H / 2 } : { x: W / 2, y: H * 0.42 };
        f = lerpPt(f, { x: Qc.x + (W / 2 - target.x) / scale, y: Qc.y + (H / 2 - target.y) / scale }, s.reveal);

        /* Keep the frame filled: inside the studio photo first, inside the artwork while close. */
        const rr = (Math.abs(s.roll) * Math.PI) / 180;
        const hw = ((W / 2) * Math.cos(rr) + (H / 2) * Math.sin(rr)) / scale;
        const hh = ((W / 2) * Math.sin(rr) + (H / 2) * Math.cos(rr)) / scale;
        const inStudio = 1 - smoothstep(0.4, 0.8, s.deep);
        const inArt = smoothstep(0.5, 0.85, s.deep) * (1 - s.reveal);
        const inset = 0.04 * Fh * s.tilt; // the leaning plane is a little smaller at the top
        f = {
          x: lerp(f.x, clamp(f.x, hw, world.width - hw), inStudio),
          y: lerp(f.y, clamp(f.y, hh, world.height - hh), inStudio),
        };
        f = {
          x: lerp(f.x, clamp(f.x, Qc.x - Fw / 2 + hw + inset, Qc.x + Fw / 2 - hw - inset), inArt),
          y: lerp(f.y, clamp(f.y, Qc.y - Fh / 2 + hh + inset, Qc.y + Fh / 2 - hh - inset), inArt),
        };

        worldEl.style.transform = `translate(${W / 2}px, ${H / 2}px) rotate(${s.roll}deg) scale(${scale}) translate(${-f.x}px, ${-f.y}px)`;
        studioEl.style.opacity = frontEl.style.opacity = String(s.studio);
        planeEl.style.transform = matrix3d(Hm);

        /* The surfer: lifts off his spot, leans into the turns, floats on a nearer plane. */
        const active = smoothstep(0, 0.05, s.ride) * (1 - smoothstep(0.95, 1, s.ride));
        const away = smoothstep(0.003, 0.018, Math.hypot(r.u - HOME.u, r.v - HOME.v));
        const swell = Math.sin(s.ride * Math.PI * 6);
        const lift = active * (0.5 + 0.5 * swell);
        const ahead = ride(Math.min(1, s.ride + 0.01));
        const bank = clamp((ahead.turn - r.turn) * 0.9, -9, 9) * active;
        // parallax: offset from the frame centre, a little more than the paint moves
        const rad = (s.roll * Math.PI) / 180;
        const dx = surferW.x - f.x;
        const dy = surferW.y - f.y;
        const sx = (dx * Math.cos(rad) - dy * Math.sin(rad)) * scale;
        const sy = (dx * Math.sin(rad) + dy * Math.cos(rad)) * scale;
        const pxPerArt = scale * (Fh / ah);
        const depth = 0.1 * active;
        surferEl.style.transform =
          `translate(${r.u * aw - (SURFER.box.width * unit) / 2}px, ${r.v * ah - (SURFER.box.height * unit) / 2}px) ` +
          `translate(${(sx * depth) / pxPerArt}px, ${(sy * depth) / pxPerArt - lift * 3 * unit}px) ` +
          `rotate(${r.turn + bank}deg) scale(${1 + 0.07 * lift})`;
        // light falls from the upper left in the photo: shadow down and to the right, longer when lifted
        shadowEl.style.opacity = String(0.32 * active);
        shadowEl.style.transform = `translate(${(3 + 7 * lift) * unit}px, ${(4 + 9 * lift) * unit}px)`;
        plateEl.style.opacity = String(away);
      };

      gsap.set(label, { autoAlpha: 1, y: 0 });
      gsap.set(info, { autoAlpha: 0, y: 24 });

      const R = cam.roll;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: render,
        scrollTrigger: {
          trigger: vp,
          start: "top top",
          end: () => `+=${vp.clientHeight * cam.screens}`,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: render,
        },
      });
      trigger.current = tl.scrollTrigger ?? null;

      tl
        // Scene 1 — The Gallery
        .to(label, { autoAlpha: 0, y: -16, duration: 0.5, ease: "power1.in" }, 0.15)
        // Scene 2 — Enter the Canvas: slow, then a subtle acceleration, then deep into the paint
        .to(s, { push: 1, duration: 1.5, ease: "power1.in" }, 0.3)
        .to(s, { approach: 1, duration: 1.6, ease: "power2.inOut" }, 1.6)
        .to(s, { flat: 1, duration: 1.7, ease: "power2.inOut" }, 2.1)
        .to(s, { roll: -1.2, duration: 1, ease: "sine.inOut" }, 1.8)
        .to(s, { roll: 0, duration: 1, ease: "sine.inOut" }, 2.8)
        .to(s, { deep: 1, duration: 1.9, ease: "power2.inOut" }, 3.4)
        .to(s, { studio: 0, duration: 0.5 }, 4.45)
        .to(s, { tilt: 1, duration: 1.4, ease: "sine.inOut" }, 4.4)
        // Scene 3 — Ride the Wave
        .to(s, { follow: 1, duration: 0.5, ease: "sine.inOut" }, 5.3)
        .to(s, { ride: 1, duration: 3, ease: "sine.inOut" }, 5.3)
        .to(s, { breathe: 1, duration: 1.5, ease: "sine.inOut" }, 5.3)
        .to(s, { breathe: 0, duration: 1.5, ease: "sine.inOut" }, 6.8)
        .to(s, { roll: R, duration: 1, ease: "sine.inOut" }, 5.4)
        .to(s, { roll: -R * 0.7, duration: 1.2, ease: "sine.inOut" }, 6.4)
        .to(s, { roll: 0, duration: 0.8, ease: "sine.inOut" }, 7.6)
        .to(s, { follow: 0, duration: 0.6, ease: "sine.inOut" }, 8.1)
        // Scene 4 — The Reveal
        .to(s, { reveal: 1, tilt: 0, duration: 1.5, ease: "power2.inOut" }, 8.2)
        .to(info, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 9.2)
        .to({}, { duration: 0.6 });

      gsap.to(s, { ambient: 1, duration: 6, ease: "sine.out", onUpdate: render });

      render();
      return () => {
        trigger.current = null;
        for (const el of [studioEl, frontEl, plateEl, surferEl, shadowEl]) el.removeAttribute("style");
        // these carry their layout size inline; only reset what render() set
        worldEl.style.transform = planeEl.style.transform = "";
        frontEl.style.left = `${world.front.x}px`;
        frontEl.style.top = `${world.front.y}px`;
        frontEl.style.width = `${world.front.width}px`;
        frontEl.style.height = `${world.front.height}px`;
        vp.style.removeProperty("--info-left");
        vp.style.removeProperty("--reveal-bottom");
      };
    });

    return () => mm.revert();
  }, [artwork.width, artwork.height]);

  /** Keyboard / screen reader: jump straight to the end of the scene. */
  const skip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const st = trigger.current;
    if (!st) return; // no animation running: the plain anchor link does the job
    e.preventDefault();
    window.scrollTo({ top: st.end, behavior: "auto" });
    // The smoothed scrub needs a moment to reach the end; focus once the details are visible.
    const target = document.querySelector<HTMLElement>(
      window.matchMedia(INFO_BESIDE).matches ? "[data-info] h1" : "#details",
    );
    let tries = 0;
    const tryFocus = () => {
      st.getTween()?.progress(1);
      target?.focus({ preventScroll: true });
      if (document.activeElement !== target && ++tries < 40) setTimeout(tryFocus, 50);
    };
    requestAnimationFrame(tryFocus);
  };

  const surferSrc = SURFER.src;
  const worlds = [
    { world: WORLDS.wide, image: studioWide },
    { world: WORLDS.tall, image: studioTall },
  ];

  return (
    <section className={styles.experience} aria-label={`${work.title}: from the studio into the paint`}>
      <a href="#details" className={styles.skip} onClick={skip}>
        Skip the animation
      </a>

      <div ref={viewport} className={styles.viewport} data-hero="bleed">
        {worlds.map(({ world, image }) => (
          <div
            key={world.key}
            className={styles.world}
            data-world={world.key}
            style={{ width: world.width, height: world.height }}
          >
            <Image
              src={image.url}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes={`${image.width}px`}
              quality={90}
              className={styles.studio}
              data-studio
            />

            {/* The real artwork photo, laid onto the canvas */}
            <div className={styles.plane} style={{ width: artwork.width, height: artwork.height }} data-plane>
              <Image
                src={artwork.url}
                alt={artwork.alt}
                width={artwork.width}
                height={artwork.height}
                sizes={`${artwork.width}px`}
                quality={90}
                className={styles.artwork}
              />
              <img src={CLEANPLATE.src} alt="" className={styles.plate} data-plate />
              <div className={styles.surfer} data-surfer>
                <img src={surferSrc} alt="" className={styles.surferShadow} data-surfer-shadow />
                <img src={surferSrc} alt="" className={styles.surferImage} />
              </div>
            </div>

            {/* The artist's arm and brush, in front of the canvas */}
            <img
              src={world.front.src}
              alt=""
              className={styles.front}
              style={{ left: world.front.x, top: world.front.y, width: world.front.width, height: world.front.height }}
              data-front
            />
          </div>
        ))}

        {/* Scene 1 label, like a gallery wall label */}
        <div className={styles.label} data-label>
          <p className={styles.labelTitle}>{work.title}</p>
          <p className={styles.labelMeta}>Daphne Merel{work.year ? `, ${work.year}` : ""}</p>
          <p className={styles.scroll} aria-hidden="true">
            <span className={styles.scrollLine} />
            Scroll to explore
          </p>
        </div>

        {/* Scene 4, beside the work (large screens) */}
        <div className={styles.info} data-info>
          <p className={styles.eyebrow}>Original artwork</p>
          <h1 className={styles.title} tabIndex={-1}>
            {work.title}
          </h1>
          <dl className={styles.meta}>
            {work.year && (
              <>
                <dt className="visually-hidden">Year</dt>
                <dd>{work.year}</dd>
              </>
            )}
            <dt className="visually-hidden">Medium</dt>
            <dd>{work.medium}</dd>
            {work.dimensions && (
              <>
                <dt className="visually-hidden">Dimensions</dt>
                <dd>{work.dimensions}</dd>
              </>
            )}
          </dl>
          {work.summary && <p className={styles.summary}>{work.summary}</p>}
          {work.price && <p className={styles.price}>{work.price}</p>}
          {email && (
            <a href={`mailto:${email}?subject=${subject}`} className={`button ${styles.buy}`}>
              Buy this work <span aria-hidden="true">→</span>
            </a>
          )}
          <a href="#about" className={styles.more}>
            More details
          </a>
        </div>

        {/* Scene 4 on smaller screens: a short label; the details follow below */}
        <div className={styles.revealLabel} data-reveal-label aria-hidden="true">
          <p className={styles.labelTitle}>{work.title}</p>
          <p className={styles.labelMeta}>Daphne Merel{work.year ? `, ${work.year}` : ""}</p>
        </div>
      </div>

      {/* Without motion: the studio photo, still */}
      <div className={styles.still}>
        <Image
          src={studioWide.url}
          alt={studioWide.alt}
          width={studioWide.width}
          height={studioWide.height}
          sizes="100vw"
          quality={90}
          className={styles.stillImage}
        />
      </div>
    </section>
  );
}
