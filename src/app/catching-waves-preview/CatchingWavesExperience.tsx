"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Prose } from "@/components/type/Prose";
import styles from "./preview.module.css";

gsap.registerPlugin(ScrollTrigger);

type Img = { url: string; width: number; height: number; alt: string };

type Props = {
  work: {
    slug: string;
    title: string;
    year?: number;
    medium: string;
    dimensions?: string;
    summary?: string;
    price?: string;
    html: string;
  };
  email?: string;
  artwork: Img;
  studioWide: Img;
  studioTall: Img;
};

/* ---------- scene geometry ---------- */

/** Where the canvas sits in journey-studio.jpg, in that image's own pixels (measured by hand). */
const STUDIO_CANVAS = { cx: 1173, cy: 467, height: 640 };
/** The canvas in the studio photo is turned slightly away on its left side. */
const STUDIO_TILT = { y: -10, z: -1.5 };

/** The surfer cut-out, taken from the artwork photo itself (01.jpg, box 919,155 → 1023,248). */
const SURFER = { src: "/images/preview/catching-waves-surfer.png", width: 104, height: 93 };
/** Direction the board points in the cut-out, in degrees (tail upper left → nose lower right). */
const SURFER_BOARD_ANGLE = 22;

/**
 * The ride, in artwork coordinates (0–1). It follows the diagonal strokes in the lower left of the
 * painting, an area without painted figures, passing below the swimmer on the long stroke.
 */
const RIDE: [number, number][] = [
  [0.08, 0.6],
  [0.17, 0.66],
  [0.27, 0.71],
  [0.37, 0.78],
  [0.47, 0.84],
];

/**
 * How far the camera goes into the paint (1 = the painting just covers the screen). Limited by
 * the resolution of 01.jpg (1254 px): higher values look soft. Raise once a larger file is in.
 */
const MAX_DIVE = 1.8;

/** Scroll length of the pinned scene, in screen heights. */
const SCROLL_SCREENS = 7;

const DESKTOP = "(min-width: 900px) and (prefers-reduced-motion: no-preference)";
const MOBILE = "(max-width: 899px) and (prefers-reduced-motion: no-preference)";

/* ---------- small maths helpers ---------- */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) =>
  min > max ? (min + max) / 2 : Math.min(Math.max(v, min), max);

/** Catmull-Rom point and tangent angle on the ride path, p in 0–1. */
function ridePoint(p: number) {
  const n = RIDE.length - 1;
  const t = clamp(p, 0, 1) * n;
  const i = Math.min(Math.floor(t), n - 1);
  const f = t - i;
  const p0 = RIDE[Math.max(i - 1, 0)];
  const p1 = RIDE[i];
  const p2 = RIDE[i + 1];
  const p3 = RIDE[Math.min(i + 2, n)];
  const cr = (a: number, b: number, c: number, d: number, s: number) =>
    0.5 * (2 * b + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s * s + (-a + 3 * b - 3 * c + d) * s * s * s);
  const dcr = (a: number, b: number, c: number, d: number, s: number) =>
    0.5 * (-a + c + 2 * (2 * a - 5 * b + 4 * c - d) * s + 3 * (-a + 3 * b - 3 * c + d) * s * s);
  const u = cr(p0[0], p1[0], p2[0], p3[0], f);
  const v = cr(p0[1], p1[1], p2[1], p3[1], f);
  const du = dcr(p0[0], p1[0], p2[0], p3[0], f);
  const dv = dcr(p0[1], p1[1], p2[1], p3[1], f);
  return { u, v, angle: (Math.atan2(dv, du) * 180) / Math.PI };
}

export function CatchingWavesExperience({ work, email, artwork, studioWide, studioTall }: Props) {
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const studio = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const surfer = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  const info = useRef<HTMLDivElement>(null);

  const subject = encodeURIComponent(`${work.title}${work.year ? `, ${work.year}` : ""}`);
  const artAspect = artwork.width / artwork.height;

  const studioWideSrcSet = getImageProps({
    src: studioWide.url,
    alt: studioWide.alt,
    width: studioWide.width,
    height: studioWide.height,
    quality: 90,
    sizes: "200vw",
  }).props.srcSet;
  const { props: studioTallProps } = getImageProps({
    src: studioTall.url,
    alt: studioTall.alt,
    width: studioTall.width,
    height: studioTall.height,
    quality: 90,
    sizes: "100vw",
    fetchPriority: "high",
  });

  useEffect(() => {
    const mm = gsap.matchMedia();

    /* ---------- desktop: one pinned, scroll-scrubbed camera move ---------- */
    mm.add(DESKTOP, () => {
      const vp = viewport.current!;
      const studioEl = studio.current!;
      const artEl = art.current!;
      const surferEl = surfer.current!;
      const surferImg = surferEl.querySelector<HTMLElement>("[data-surfer]")!;
      const shadowImg = surferEl.querySelector<HTMLElement>("[data-shadow]")!;

      // Everything the timeline animates; render() turns it into transforms.
      const s = {
        zoom: 0, // studio camera: 0 = whole room, 1 = canvas fills the screen height
        studioOpacity: 1,
        artOpacity: 0,
        detach: 0, // 0 = painting sits on the easel, 1 = free camera over the painting
        tilt: 1, // 1 = turned like the canvas in the photo, 0 = facing the camera
        dive: 1, // painting size relative to "just covers the screen"
        u: 0.5, // camera target on the painting (0–1)
        v: 0.5,
        follow: 0, // 0 = camera on (u, v), 1 = camera follows the surfer
        roll: 0, // slight camera roll in degrees
        ride: 0, // surfer position on the path (0–1)
        surferOpacity: 0,
        surferScale: 0.7,
        settle: 0, // 1 = whole painting, uncropped, beside the details
      };

      const render = () => {
        const W = vp.clientWidth;
        const H = vp.clientHeight;
        const margin = Math.max(20, W * 0.06);

        /* Studio photo, cover-fitted, zooming towards the canvas without showing its edges. */
        const k = Math.max(W / studioWide.width, H / studioWide.height);
        const zEnd = (H * 1.18) / (STUDIO_CANVAS.height * k);
        const z = 1 + (zEnd - 1) * s.zoom;
        const toward = Math.min(s.zoom, 1);
        const fx = lerp(studioWide.width / 2, STUDIO_CANVAS.cx, toward);
        const fy = lerp(studioWide.height / 2, STUDIO_CANVAS.cy, toward);
        const sx = clamp(W / 2 - fx * k * z, W - studioWide.width * k * z, 0);
        const sy = clamp(H / 2 - fy * k * z, H - studioWide.height * k * z, 0);
        studioEl.style.width = `${studioWide.width * k}px`;
        studioEl.style.height = `${studioWide.height * k}px`;
        studioEl.style.transform = `translate3d(${sx}px, ${sy}px, 0) scale(${z})`;
        studioEl.style.opacity = String(s.studioOpacity);

        /* Painting on the easel: tracks the canvas in the photo. */
        const easel = {
          cx: sx + STUDIO_CANVAS.cx * k * z,
          cy: sy + STUDIO_CANVAS.cy * k * z,
          h: STUDIO_CANVAS.height * k * z,
        };

        /* Free camera over the painting. */
        const cover = Math.max(H, W / artAspect);
        const camH = s.dive * cover;
        const camW = camH * artAspect;
        const pos = ridePoint(s.ride);
        const lag = ridePoint(s.ride - 0.06); // the camera trails the surfer a little
        const u = clamp(lerp(s.u, lag.u, s.follow), W / (2 * camW), 1 - W / (2 * camW));
        const v = clamp(lerp(s.v, lag.v, s.follow), H / (2 * camH), 1 - H / (2 * camH));
        const cam = { cx: W / 2 - (u - 0.5) * camW, cy: H / 2 - (v - 0.5) * camH, h: camH };

        /* Final: the whole work, uncropped, on the left. */
        const finalH = Math.min(H * 0.76, (W * 0.5) / artAspect);
        const final = { cx: margin + (finalH * artAspect) / 2, cy: H / 2, h: finalH };
        vp.style.setProperty("--info-left", `${margin + finalH * artAspect + 64}px`);

        const mix = (key: "cx" | "cy" | "h") =>
          lerp(lerp(easel[key], cam[key], s.detach), final[key], s.settle);
        const cx = mix("cx");
        const cy = mix("cy");
        const h = mix("h");

        const baseH = H; // the element is laid out at screen height and scaled from there
        artEl.style.width = `${baseH * artAspect}px`;
        artEl.style.height = `${baseH}px`;
        artEl.style.opacity = String(s.artOpacity);
        artEl.style.transform =
          `translate3d(${cx - (baseH * artAspect) / 2}px, ${cy - baseH / 2}px, 0) ` +
          `perspective(${baseH * 2}px) rotateY(${STUDIO_TILT.y * s.tilt}deg) ` +
          `rotateZ(${STUDIO_TILT.z * s.tilt + s.roll}deg) scale(${h / baseH})`;

        /* Surfer: rides the path, leans into it, bobs, and floats a touch above the paint. */
        const scale = h / baseH;
        const screenX = cx + (pos.u - 0.5) * h * artAspect;
        const screenY = cy + (pos.v - 0.5) * h;
        const depth = 0.12; // parallax: the figure sits on a nearer plane than the paint
        const px = ((screenX - W / 2) * depth) / scale;
        const py = ((screenY - H / 2) * depth) / scale;
        const swell = Math.sin(s.ride * Math.PI * 7);
        const lean = (pos.angle - SURFER_BOARD_ANGLE) * 0.6 + Math.sin(s.ride * Math.PI * 5) * 4;
        surferEl.style.left = `${pos.u * 100}%`;
        surferEl.style.top = `${pos.v * 100}%`;
        surferEl.style.opacity = String(s.surferOpacity);
        surferEl.style.transform =
          `translate(-50%, -50%) translate(${px}px, ${py - swell * 3}px) ` +
          `rotate(${lean}deg) scale(${s.surferScale})`;
        const lift = 0.5 + 0.5 * swell;
        surferImg.style.transform = `translateY(${-lift * 4}px)`;
        shadowImg.style.transform = `translate(${4 + lift * 5}px, ${6 + lift * 6}px)`;
      };

      gsap.set(hint.current, { autoAlpha: 1 });
      gsap.set(info.current, { autoAlpha: 0, y: 24 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: render,
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${vp.clientHeight * SCROLL_SCREENS}`,
          pin: vp,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: render,
        },
      });

      tl
        // 1. The studio, then a slow move in on the easel.
        .to(hint.current, { autoAlpha: 0, duration: 0.4 }, 0.1)
        .to(s, { zoom: 1, duration: 3, ease: "power1.inOut" }, 0.3)
        // 2. The photographed canvas gives way to the painting itself, which turns to face us.
        .to(s, { artOpacity: 1, duration: 0.45, ease: "sine.inOut" }, 2.75)
        .to(s, { detach: 1, tilt: 0, duration: 1.1, ease: "power2.inOut" }, 3.2)
        .to(s, { zoom: 1.25, duration: 1.1, ease: "power1.out" }, 3.3)
        .to(s, { studioOpacity: 0, duration: 0.4 }, 3.9)
        // 3. Into the paint: closer, drifting down to where the ride begins.
        .to(s, { dive: MAX_DIVE, u: RIDE[0][0], v: RIDE[0][1], duration: 1.4, ease: "power2.inOut" }, 4.3)
        .to(s, { roll: -2, duration: 1.4, ease: "sine.inOut" }, 4.3)
        // 4. A surfer appears and rides the strokes; the camera follows.
        .to(s, { surferOpacity: 1, surferScale: 1, duration: 0.5, ease: "power2.out" }, 5.3)
        .to(s, { follow: 1, duration: 0.6, ease: "sine.inOut" }, 5.5)
        .to(s, { ride: 1, duration: 3.2, ease: "sine.inOut" }, 5.5)
        .to(s, { roll: 1.5, duration: 1.6, ease: "sine.inOut" }, 5.7)
        .to(s, { roll: -1, duration: 1.6, ease: "sine.inOut" }, 7.3)
        .to(s, { dive: MAX_DIVE * 0.88, duration: 1.6, ease: "sine.inOut" }, 6.5)
        // 5. The surfer rides off; the camera pulls back to the whole work and its details.
        .to(s, { surferOpacity: 0, surferScale: 0.85, duration: 0.5 }, 8.5)
        .to(s, { follow: 0, u: 0.5, v: 0.5, roll: 0, duration: 1.4, ease: "power2.inOut" }, 8.7)
        .to(s, { settle: 1, dive: 1, duration: 1.4, ease: "power2.inOut" }, 8.8)
        .to(info.current, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" }, 9.9)
        .to({}, { duration: 0.6 }); // hold on the final view before the page continues

      render();
      ScrollTrigger.addEventListener("refresh", render);
      return () => {
        ScrollTrigger.removeEventListener("refresh", render);
        for (const el of [studioEl, artEl, surferEl, surferImg, shadowImg]) el.removeAttribute("style");
        vp.style.removeProperty("--info-left");
      };
    });

    /* ---------- phones: no pinning, a few light scroll-linked moves ---------- */
    mm.add(MOBILE, () => {
      const surferEl = surfer.current!;
      const place = (p: number) => {
        const pos = ridePoint(p);
        surferEl.style.left = `${pos.u * 100}%`;
        surferEl.style.top = `${pos.v * 100}%`;
        const lean = (pos.angle - SURFER_BOARD_ANGLE) * 0.6 + Math.sin(p * Math.PI * 5) * 3;
        surferEl.style.transform = `translate(-50%, -50%) rotate(${lean}deg)`;
      };
      place(0);

      gsap.fromTo(
        studio.current!.querySelector("[data-studio-image]"),
        { scale: 1 },
        {
          scale: 1.12,
          ease: "none",
          scrollTrigger: { trigger: studio.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );

      const ride = { p: 0 };
      gsap.to(ride, {
        p: 1,
        ease: "none",
        onUpdate: () => place(ride.p),
        scrollTrigger: { trigger: art.current, start: "top 85%", end: "bottom 25%", scrub: 0.5 },
      });

      return () => surferEl.removeAttribute("style");
    });

    return () => mm.revert();
  }, [artAspect, studioWide.width, studioWide.height]);

  return (
    <article ref={root} className={styles.preview}>
      <section className={styles.stage} aria-label={`${work.title}: from the studio into the paint`}>
        <div ref={viewport} className={styles.viewport}>
          <div ref={studio} className={styles.studio}>
            {/* Wide studio photo on desktop (the camera moves through it), the tall one on phones. */}
            <picture>
              <source media="(min-width: 900px)" srcSet={studioWideSrcSet} sizes="200vw" />
              <img {...studioTallProps} className={styles.studioImage} data-studio-image />
            </picture>
          </div>

          <div ref={art} className={styles.art}>
            <Image
              src={artwork.url}
              alt={artwork.alt}
              width={artwork.width}
              height={artwork.height}
              // Zoomed far in on desktop, so always fetch the largest file there is.
              sizes="(max-width: 899px) 100vw, 3000px"
              quality={90}
              className={styles.artImage}
            />
            <div ref={surfer} className={styles.surfer} aria-hidden="true">
              <img src={SURFER.src} alt="" width={SURFER.width} height={SURFER.height} className={styles.surferShadow} data-shadow />
              <img src={SURFER.src} alt="" width={SURFER.width} height={SURFER.height} className={styles.surferImage} data-surfer />
            </div>
          </div>

          <p ref={hint} className={styles.hint} aria-hidden="true">
            Scroll
          </p>

          <div ref={info} className={styles.info}>
            <p className={styles.eyebrow}>Original artwork</p>
            <h1 className={styles.title}>{work.title}</h1>
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
        </div>
      </section>

      <section id="about" className={`${styles.about} container`} aria-label={`About ${work.title}`}>
        <Prose html={work.html} />
        <p className={styles.back}>
          <Link href={`/works/${work.slug}`}>View the work page</Link>
        </p>
      </section>
    </article>
  );
}
