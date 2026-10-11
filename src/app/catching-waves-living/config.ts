import type { LivingArtworkConfig, Picture } from "@/lib/living-artwork/engine";

/*
 * Experiment 02 — Catching Waves as a "living artwork": the painting stays as it is; only the
 * green-board surfer (cut out of 01.jpg itself) rides a short way down his own stroke, then the
 * camera pulls back and the untouched painting returns.
 *
 * Units: pixels of 01.jpg (1254 × 1254). Layers made by scripts/catching-waves-preview/make-layers.py.
 */
export function catchingWavesLiving(artwork: Picture): LivingArtworkConfig {
  return {
    artwork,
    object: {
      src: "/images/preview/catching-waves-surfer.png",
      x: 919,
      y: 155,
      width: 104,
      height: 93,
      origin: "50% 60%",
      // his spot, filled with paint from lower down the same stroke — only seen while he is away
      underpaint: { src: "/images/preview/catching-waves-cleanplate.png", x: 879, y: 115, width: 184, height: 173 },
      shadow: { opacity: 0.3, x: 3, y: 4, blur: 1.5 },
    },
    // down the broad curved stroke on the right (the same path as Experiment 01's ride)
    // one smooth, continuous ride: no push-off shake, no blur switching on and off
    motion: [
      { at: 0, dx: 0, dy: 0, rotate: 0 },
      { at: 1, dx: 52, dy: 150, rotate: 6, ease: "inOut" },
    ],
    vibration: 0,
    maxBlur: 0,
    follow: 0.7,
    camera: [
      { at: 0, focus: [627, 627], zoom: "fit" },
      { at: 0.5, focus: [627, 627], zoom: "fit" },
      { at: 2.7, focus: "home", zoom: 1.7, screen: [0.5, 0.4], ease: "sine.inOut" },
      { at: 4.6, focus: "home", zoom: 1.6, screen: [0.5, 0.4], ease: "sine.inOut" },
      { at: 7.0, focus: [627, 627], zoom: "fit", screen: { wide: [0.34, 0.5], narrow: [0.5, 0.38] }, ease: "sine.inOut" },
    ],
    timing: { aliveStart: 2.8, followInDuration: 1.4, aliveEnd: 5.6, followOut: 4.8, followOutDuration: 1.8, restore: [6.0, 6.7], info: 6.8, total: 7.8 },
    scroll: { screens: 6, smoothing: 1.4 },
    // 01.jpg is 1254 px: at most 1.7 screen px per photo px, so the paint never goes soft
    maxSourceScale: 1.7,
    layouts: {
      wide: { name: "wide", query: "(min-width: 900px) and (min-aspect-ratio: 1/1)", fitHeight: 0.78, fitWidth: 0.56 },
      narrow: { name: "narrow", fitHeight: 0.5, fitWidth: 0.88 },
    },
  };
}
