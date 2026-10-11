/*
 * Living Artwork — "the painting never changes; only one tiny detail briefly comes alive".
 * A reusable scroll-driven engine (GSAP + ScrollTrigger), first built as a private study and
 * used here for Daphne Merel's own works.
 *
 * Three layers inside one camera:
 *   1. the untouched photo of the work (+ optionally a sharper, registered detail photo);
 *   2. the object, cut out of that same photo, with the paint under it rebuilt from the
 *      surrounding strokes — only visible while the object is away from its spot;
 *   3. the camera: keyframes for focus and zoom, scrubbed by scroll (so it plays backwards too).
 * Zoom is capped by the real resolution of the source (maxSourceScale). While the camera pulls
 * back, the living layers fade so the untouched painting returns (timing.restore).
 */
import type { gsap as GSAP } from "gsap";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";

export type Picture = { src: string; width: number; height: number; alt: string };
type Box = { x: number; y: number; width: number; height: number };
type Screen = [number, number];

export type CameraKey = {
  /** position on the timeline (0 → timing.total) */
  at: number;
  /** artwork px, or "home" = centre of the object at rest */
  focus: [number, number] | "home";
  /** "fit" = whole work in view; a number = screen px per artwork px; or detailScale */
  zoom?: "fit" | number;
  detailScale?: number;
  /** where the focus point sits on screen (0–1), per layout name or for all */
  screen?: Screen | Record<string, Screen>;
  ease?: string;
};

export type MotionKey = { at: number; dx: number; dy: number; rotate?: number; ease?: "inOut" | "in" | "out" | "linear" };

export type LivingArtworkConfig = {
  artwork: Picture;
  detail?: Picture & { x: number; y: number; scale: number; feather?: number };
  object: Box & {
    src: string;
    layer?: "artwork" | "detail";
    origin?: string;
    underpaint: Box & { src: string };
    /** soft contact shadow under a figure, shown only while it moves */
    shadow?: { opacity: number; x: number; y: number; blur: number };
  };
  trail?: { src: string; x: number; width: number; anchorY: number; overlap: number };
  motion: MotionKey[];
  vibration?: number;
  blurPerSpeed?: number;
  maxBlur?: number;
  follow?: number;
  camera: CameraKey[];
  timing: {
    aliveStart: number;
    aliveEnd: number;
    followOut?: number;
    followOutDuration?: number;
    restore?: [number, number];
    info: number;
    total: number;
  };
  scroll: { screens: number; smoothing?: number };
  maxSourceScale: number;
  layouts: {
    wide: { name: string; query: string; fitHeight: number; fitWidth: number };
    narrow: { name: string; fitHeight: number; fitWidth: number };
  };
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.min(Math.max(v, lo), hi));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const EASE = {
  inOut: (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t),
  in: (t: number) => t * t,
  out: (t: number) => 1 - (1 - t) * (1 - t),
  linear: (t: number) => t,
};

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string>,
  style: Record<string, string>,
  parent: HTMLElement,
) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const [k, v] of Object.entries(style)) node.style.setProperty(k.startsWith("--") ? k : k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()), v);
  parent.appendChild(node);
  return node;
}

/**
 * @param parts.root   scroll trigger (the whole experience)
 * @param parts.stage  the pinned screen; its size defines the view
 * @param parts.camera an empty element inside the stage; the engine fills it
 */
export function createLivingArtwork(
  parts: { root: HTMLElement; stage: HTMLElement; camera: HTMLElement },
  config: LivingArtworkConfig,
  gsap: typeof GSAP,
  ScrollTrigger: typeof ST,
) {
  const { root, stage, camera } = parts;
  const base = config.artwork;
  const detail = config.detail ?? null;
  const obj = config.object;
  const onDetail = obj.layer === "detail" && !!detail;
  const unit = onDetail ? detail!.scale : 1; // artwork px per object-layer px

  /* ---------- DOM (inside the camera only) ---------- */
  camera.replaceChildren();
  camera.style.width = `${base.width}px`;
  camera.style.height = `${base.height}px`;
  el("img", { class: "la-artwork", src: base.src, alt: base.alt, width: String(base.width), height: String(base.height) }, {}, camera);
  let detailEl: HTMLElement | null = null;
  if (detail) {
    detailEl = el(
      "div",
      { class: "la-detail" },
      {
        left: `${detail.x}px`,
        top: `${detail.y}px`,
        width: `${detail.width}px`,
        height: `${detail.height}px`,
        transform: `scale(${detail.scale})`,
        "--feather": `${(detail.feather ?? 0.05) * 100}%`,
      },
      camera,
    );
    el("img", { src: detail.src, alt: "", width: String(detail.width), height: String(detail.height) }, {}, detailEl);
  }
  const layer = onDetail ? detailEl! : camera;
  const px = (b: Box) => ({ left: `${b.x}px`, top: `${b.y}px`, width: `${b.width}px`, height: `${b.height}px` });

  const under = el("img", { class: "la-under", src: obj.underpaint.src, alt: "" }, px(obj.underpaint), layer);
  const trail = config.trail ?? null;
  const trailEl = trail
    ? el(
        "div",
        { class: "la-trail" },
        {
          left: `${trail.x}px`,
          width: `${trail.width}px`,
          backgroundImage: `url("${trail.src}")`,
          backgroundSize: "100% auto",
          backgroundRepeat: "repeat-y",
          backgroundPosition: "0 100%",
        },
        layer,
      )
    : null;
  const shadowEl = obj.shadow
    ? el("img", { class: "la-shadow", src: obj.src, alt: "" }, { ...px(obj), filter: `brightness(0) blur(${obj.shadow.blur}px)`, opacity: "0" }, layer)
    : null;
  const thing = el("img", { class: "la-object", src: obj.src, alt: "" }, { ...px(obj), transformOrigin: obj.origin ?? "50% 60%" }, layer);

  // speed-dependent motion blur along the direction of travel (SVG filter on the object only)
  const blurId = `la-blur-${Math.random().toString(36).slice(2, 8)}`;
  camera.insertAdjacentHTML(
    "beforeend",
    `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="${blurId}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="0 0"/></filter></svg>`,
  );
  const blurNode = camera.querySelector(`#${blurId} feGaussianBlur`)!;

  const home = {
    x: (obj.x + obj.width / 2) * unit + (onDetail ? detail!.x : 0),
    y: (obj.y + obj.height / 2) * unit + (onDetail ? detail!.y : 0),
  };

  /* ---------- state ---------- */
  const s = { fx: 0, fy: 0, logZ: 0, alive: 0, follow: 0, restore: 0 };
  const motion = config.motion;

  function motionAt(p: number) {
    let a = motion[0];
    let b = motion[motion.length - 1];
    for (let i = 0; i < motion.length - 1; i++) {
      if (p >= motion[i].at && p <= motion[i + 1].at) {
        a = motion[i];
        b = motion[i + 1];
        break;
      }
    }
    const t = b.at === a.at ? 0 : (p - a.at) / (b.at - a.at);
    const e = EASE[b.ease ?? "inOut"](clamp(t, 0, 1));
    return { dx: lerp(a.dx, b.dx, e), dy: lerp(a.dy, b.dy, e), rotate: lerp(a.rotate ?? 0, b.rotate ?? 0, e) };
  }

  const mq = window.matchMedia(config.layouts.wide.query);
  const layout = () => (mq.matches ? config.layouts.wide : config.layouts.narrow);

  function frameFor(key: CameraKey, W: number, H: number) {
    const L = layout();
    const fitScale = Math.min((L.fitHeight * H) / base.height, (L.fitWidth * W) / base.width);
    let zoom: number;
    if (key.zoom === "fit") zoom = fitScale;
    else if (key.detailScale && detail) zoom = key.detailScale / detail.scale;
    else zoom = typeof key.zoom === "number" ? key.zoom : fitScale;
    const [fx, fy] = key.focus === "home" ? [home.x, home.y] : key.focus;
    const scr = key.screen && !Array.isArray(key.screen) ? key.screen[L.name] : key.screen;
    const offX = scr ? (W / 2 - scr[0] * W) / zoom : 0;
    const offY = scr ? (H / 2 - scr[1] * H) / zoom : 0;
    return { fx: fx + offX, fy: fy + offY, logZ: Math.log(zoom) };
  }

  function render() {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const baseCap = config.maxSourceScale;
    const cap = detail ? baseCap / detail.scale : baseCap;
    const zoom = Math.min(Math.exp(s.logZ), cap);

    const m = motionAt(s.alive);
    const ahead = motionAt(Math.min(1, s.alive + 0.01));
    const vx = (ahead.dx - m.dx) * 100;
    const vy = (ahead.dy - m.dy) * 100;
    const speed = Math.hypot(vx, vy);
    const vib = (config.vibration ?? 0) * Math.sin(s.alive * 900) * smoothstep(0.02, 0.1, s.alive) * (1 - smoothstep(0.35, 0.6, s.alive));
    const away = smoothstep(0.2, 2.5, Math.hypot(m.dx, m.dy));
    const shown = 1 - s.restore;

    thing.style.transform = `translate(${m.dx + vib}px, ${m.dy}px) rotate(${m.rotate}deg)`;
    thing.style.opacity = String(shown);
    under.style.opacity = String(away * shown);
    if (shadowEl && obj.shadow) {
      shadowEl.style.transform = `translate(${m.dx + obj.shadow.x}px, ${m.dy + obj.shadow.y}px) rotate(${m.rotate}deg)`;
      shadowEl.style.opacity = String(obj.shadow.opacity * away * shown);
    }
    const blur = Math.min(config.maxBlur ?? 2, speed * (config.blurPerSpeed ?? 0.005));
    if (blur > 0.05) {
      // blur along the direction of travel: split over x and y by the velocity direction
      const bx = (Math.abs(vx) / (speed || 1)) * blur;
      const by = (Math.abs(vy) / (speed || 1)) * blur;
      blurNode.setAttribute("stdDeviation", `${bx.toFixed(2)} ${by.toFixed(2)}`);
      thing.style.filter = `url(#${blurId})`;
    } else thing.style.filter = "none";
    if (trailEl && trail) {
      const top = trail.anchorY + m.dy - trail.overlap;
      trailEl.style.left = `${trail.x + m.dx}px`;
      trailEl.style.top = `${top}px`;
      trailEl.style.height = `${Math.max(0, trail.anchorY + trail.overlap - top)}px`;
      trailEl.style.opacity = String(shown * smoothstep(0.5, 3, -m.dy));
    }

    let fx = s.fx + m.dx * unit * (config.follow ?? 0.6) * s.follow;
    let fy = s.fy + m.dy * unit * (config.follow ?? 0.6) * s.follow;

    // Keep the view inside the image once it fits there: the sharp detail photo if there is one
    // (never show the small file enlarged), otherwise the artwork photo itself.
    const f = detail ? (detail.feather ?? 0.05) * 1.1 : 0;
    const rect = detail
      ? { x: detail.x, y: detail.y, w: detail.width * detail.scale, h: detail.height * detail.scale }
      : { x: 0, y: 0, w: base.width, h: base.height };
    const x0 = rect.x + rect.w * f, x1 = rect.x + rect.w * (1 - f);
    const y0 = rect.y + rect.h * f, y1 = rect.y + rect.h * (1 - f);
    const fitsX = W / (x1 - x0), fitsY = H / (y1 - y0);
    const gate = detail ? smoothstep(baseCap, baseCap * 1.5, zoom) : 1;
    const inX = smoothstep(fitsX * 0.8, fitsX, zoom) * gate;
    const inY = smoothstep(fitsY * 0.8, fitsY, zoom) * gate;
    const hw = W / 2 / zoom, hh = H / 2 / zoom;
    fx = lerp(fx, clamp(fx, x0 + hw, x1 - hw), inX);
    fy = lerp(fy, clamp(fy, y0 + hh, y1 - hh), inY);

    camera.style.transform = `translate(${W / 2}px, ${H / 2}px) scale(${zoom}) translate(${-fx}px, ${-fy}px)`;
  }

  /* ---------- timeline ---------- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let tl: gsap.core.Timeline | null = null;
  const info = () => root.querySelectorAll<HTMLElement>("[data-la-info]");

  function build() {
    tl?.scrollTrigger?.kill();
    tl?.kill();
    tl = null;
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const keys = config.camera.map((k) => ({ ...k, ...frameFor(k, W, H) }));
    Object.assign(s, { fx: keys[0].fx, fy: keys[0].fy, logZ: keys[0].logZ, alive: 0, follow: 0, restore: 0 });

    if (reduce.matches) {
      root.classList.add("la-still");
      const end = keys[keys.length - 1];
      Object.assign(s, { fx: end.fx, fy: end.fy, logZ: end.logZ });
      render();
      gsap.set(info(), { autoAlpha: 1, y: 0 });
      return;
    }
    root.classList.remove("la-still");

    const t = config.timing;
    tl = gsap.timeline({
      defaults: { ease: "none" },
      onUpdate: render,
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: () => `+=${window.innerHeight * config.scroll.screens}`,
        pin: stage,
        scrub: config.scroll.smoothing ?? 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    for (let i = 1; i < keys.length; i++) {
      const k = keys[i];
      const prev = keys[i - 1];
      tl.to(s, { fx: k.fx, fy: k.fy, logZ: k.logZ, duration: k.at - prev.at, ease: k.ease ?? "power2.inOut" }, prev.at);
    }
    tl.to(s, { follow: 1, duration: 0.3, ease: "sine.inOut" }, t.aliveStart)
      .to(s, { alive: 1, duration: t.aliveEnd - t.aliveStart, ease: "none" }, t.aliveStart)
      .to(s, { follow: 0, duration: t.followOutDuration ?? 0.4, ease: "sine.inOut" }, t.followOut ?? t.aliveEnd - 0.4);
    if (t.restore) tl.to(s, { restore: 1, duration: t.restore[1] - t.restore[0], ease: "sine.inOut" }, t.restore[0]);
    const hint = root.querySelector("[data-la-hint]");
    if (hint) tl.to(hint, { autoAlpha: 0, duration: 0.4 }, 0.05);
    gsap.set(info(), { autoAlpha: 0, y: 16 });
    tl.to(info(), { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.12 }, t.info);
    tl.to({}, { duration: Math.max(0, t.total - tl.duration()) });
    render();
  }

  build();
  let raf = 0;
  const rebuild = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      build();
      ScrollTrigger.refresh();
    });
  };
  let lastW = window.innerWidth;
  const onResize = () => {
    if (window.innerWidth !== lastW) {
      lastW = window.innerWidth;
      rebuild();
    } else render();
  };
  mq.addEventListener("change", rebuild);
  reduce.addEventListener("change", rebuild);
  window.addEventListener("resize", onResize);

  return {
    get timeline() {
      return tl;
    },
    destroy() {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", rebuild);
      reduce.removeEventListener("change", rebuild);
      window.removeEventListener("resize", onResize);
      tl?.scrollTrigger?.kill();
      tl?.kill();
      camera.replaceChildren();
      camera.removeAttribute("style");
      root.classList.remove("la-still");
    },
  };
}
