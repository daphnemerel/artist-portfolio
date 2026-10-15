/*
 * Work 5: the two painted parrots, cut from the photograph of the work itself (no generated
 * imagery). Each bird is split into body and wing; a clean plate fills the paint behind them.
 * All coordinates are pixels of content/works/work-5/images/01.jpg (1179 × 1167).
 * Made with scripts/living-works/parrots.py.
 */
export const PARROTS = {
  width: 1179,
  height: 1167,
  plate: "/images/works/work-5/plate.jpg",
  /** Where the camera zooms to (centre of the two birds) and how far. */
  focus: { x: 572, y: 535, zoom: 2.6 },
  birds: [
    {
      key: "a",
      box: { x: 565, y: 453, w: 163, h: 107 },
      pivot: { x: 119, y: 43 }, // the shoulder, inside the box
      body: "/images/works/work-5/a-body.png",
      wing: "/images/works/work-5/a-wing.png",
      beat: 9, // wing swing in degrees
      delay: 0,
    },
    {
      key: "b",
      box: { x: 419, y: 515, w: 158, h: 106 },
      pivot: { x: 109, y: 57 },
      body: "/images/works/work-5/b-body.png",
      wing: "/images/works/work-5/b-wing.png",
      beat: -9,
      delay: 450,
    },
  ],
} as const;
