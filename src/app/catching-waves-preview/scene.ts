import type { Quad } from "./geometry";

/*
 * Scene data for the Catching Waves preview. All coordinates are in the pixels of the photos in
 * content/works/2026-catching-waves/images/ (measured; see scripts/catching-waves-preview/).
 * If a larger artwork photo replaces 01.jpg, only its size changes: the ride uses 0–1 units.
 */

export type World = {
  /** Which studio photo: "wide" = journey-studio.jpg (desktop), "tall" = 02.jpg (phones). */
  key: "wide" | "tall";
  width: number;
  height: number;
  /** Painted surface of the canvas in the studio photo. */
  canvas: Quad;
  /** The artist's arm and brush in front of the canvas, cut from the same photo. */
  front: { src: string; x: number; y: number; width: number; height: number };
};

export const WORLDS: Record<World["key"], World> = {
  wide: {
    key: "wide",
    width: 1672,
    height: 941,
    canvas: [
      { x: 905, y: 181 },
      { x: 1466, y: 118 },
      { x: 1442, y: 800 },
      { x: 889, y: 748 },
    ],
    front: { src: "/images/preview/catching-waves-front-wide.png", x: 881, y: 110, width: 592, height: 695 },
  },
  tall: {
    key: "tall",
    width: 941,
    height: 1672,
    canvas: [
      { x: 516, y: 687 },
      { x: 934, y: 638 },
      { x: 923, y: 1216 },
      { x: 494, y: 1177 },
    ],
    front: { src: "/images/preview/catching-waves-front-tall.png", x: 486, y: 630, width: 455, height: 595 },
  },
};

/** The green-board surfer, cut from 01.jpg, and the paint that fills his spot while he rides. */
export const SURFER = {
  src: "/images/preview/catching-waves-surfer.png",
  /** Box in 01.jpg pixels (1254 px wide). */
  box: { x: 919, y: 155, width: 104, height: 93 },
};
export const CLEANPLATE = {
  src: "/images/preview/catching-waves-cleanplate.png",
  box: { x: 879, y: 115, width: 184, height: 173 },
};
/** Pixel size of the artwork photo the boxes above were measured on. */
export const MEASURED_ON = 1254;

/**
 * The ride, in 0–1 artwork units. From his own spot down the broad curved stroke on the right,
 * a bottom turn near the lower end, back up the face, and a top turn into his spot again.
 */
export const RIDE: [number, number][] = [
  [0.7743, 0.1607],
  [0.7974, 0.2233],
  [0.8254, 0.303],
  [0.8493, 0.3828],
  [0.8676, 0.4585],
  [0.8612, 0.5104],
  [0.8333, 0.5183],
  [0.8134, 0.4705],
  [0.7974, 0.3987],
  [0.7775, 0.319],
  [0.7576, 0.2472],
  [0.7456, 0.1994],
  [0.7576, 0.1691],
  [0.7743, 0.1607],
];

/** Camera settings per layout. */
export const CAMERA = {
  wide: {
    /** Artwork size at the deepest point, relative to the larger screen side. Limited by 01.jpg's 1254 px. */
    dive: 2.2,
    tilt: 6, // degrees the paint plane leans back during the ride
    roll: 2.2, // max camera roll during the ride
    screens: 9, // scroll length of the pinned scene, in screen heights
  },
  tall: { dive: 1.7, tilt: 4, roll: 1.4, screens: 6 },
} as const;
