/* Small, dependency-free geometry for the preview's camera. */

export type Pt = { x: number; y: number };
export type Quad = [Pt, Pt, Pt, Pt]; // top-left, top-right, bottom-right, bottom-left

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, min: number, max: number) =>
  min > max ? (min + max) / 2 : Math.min(Math.max(v, min), max);
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
export const lerpQuad = (a: Quad, b: Quad, t: number): Quad =>
  [lerpPt(a[0], b[0], t), lerpPt(a[1], b[1], t), lerpPt(a[2], b[2], t), lerpPt(a[3], b[3], t)];

/** 3×3 homography (row-major, h[8] = 1) mapping the rectangle 0..w × 0..h onto `q`. */
export function homography(w: number, h: number, q: Quad): number[] {
  // Solve the standard 8×8 system for the four corner correspondences.
  const src = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const { x: u, y: v } = q[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  // Gaussian elimination with partial pivoting.
  for (let c = 0; c < 8; c++) {
    let p = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    [b[c], b[p]] = [b[p], b[c]];
    for (let r = c + 1; r < 8; r++) {
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  const x = new Array(8).fill(0);
  for (let r = 7; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < 8; k++) s -= A[r][k] * x[k];
    x[r] = s / A[r][r];
  }
  return [...x, 1];
}

/** CSS matrix3d() for a homography (column-major 4×4). */
export function matrix3d(H: number[]): string {
  const [a, b, c, d, e, f, g, h, i] = H;
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,${i})`;
}

export function applyH(H: number[], x: number, y: number): Pt {
  const w = H[6] * x + H[7] * y + H[8];
  return { x: (H[0] * x + H[1] * y + H[2]) / w, y: (H[3] * x + H[4] * y + H[5]) / w };
}

/** Corners of an axis-aligned rectangle (centre c, w × h) after a 3D tilt, seen in perspective. */
export function tiltedRect(c: Pt, w: number, hgt: number, tiltX: number, tiltY: number, focal = hgt * 2.4): Quad {
  const rx = (tiltX * Math.PI) / 180;
  const ry = (tiltY * Math.PI) / 180;
  const corner = (dx: number, dy: number): Pt => {
    // rotate around X (top edge away when tiltX > 0), then around Y
    const y1 = dy * Math.cos(rx);
    const z1 = dy * Math.sin(rx);
    const x2 = dx * Math.cos(ry) + z1 * Math.sin(ry);
    const z2 = -dx * Math.sin(ry) + z1 * Math.cos(ry);
    const k = focal / (focal + z2);
    return { x: c.x + x2 * k, y: c.y + y1 * k };
  };
  const hw = w / 2;
  const hh = hgt / 2;
  return [corner(-hw, -hh), corner(hw, -hh), corner(hw, hh), corner(-hw, hh)];
}

/* ---------- the ride: a closed Catmull-Rom loop at constant speed ---------- */

type Sample = { u: number; v: number; turn: number };

/**
 * Pre-samples a closed path so that p (0–1) moves at constant speed. `turn` is the heading
 * relative to the start (degrees, unwrapped), eased back to 0 at both ends so the figure leaves
 * and returns in its original pose.
 */
export function buildRide(points: [number, number][], samples = 600) {
  const n = points.length - 1; // last point equals the first
  const P = (i: number) => points[clamp(i, 0, n)];
  const cr = (a: number, b: number, c: number, d: number, f: number) =>
    0.5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
  const raw: { u: number; v: number }[] = [];
  const fine = samples * 4;
  for (let s = 0; s <= fine; s++) {
    const t = (s / fine) * n;
    const i = Math.min(Math.floor(t), n - 1);
    const f = t - i;
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    raw.push({ u: cr(p0[0], p1[0], p2[0], p3[0], f), v: cr(p0[1], p1[1], p2[1], p3[1], f) });
  }
  // arc length
  const len = [0];
  for (let i = 1; i < raw.length; i++) len.push(len[i - 1] + Math.hypot(raw[i].u - raw[i - 1].u, raw[i].v - raw[i - 1].v));
  const total = len[len.length - 1];
  const out: Sample[] = [];
  let j = 0;
  let prevAngle = 0;
  let unwrapped = 0;
  let startAngle = 0;
  for (let s = 0; s <= samples; s++) {
    const target = (s / samples) * total;
    while (j < len.length - 2 && len[j + 1] < target) j++;
    const f = (target - len[j]) / (len[j + 1] - len[j] || 1);
    const a = raw[j], b = raw[Math.min(j + 1, raw.length - 1)];
    const u = lerp(a.u, b.u, f), v = lerp(a.v, b.v, f);
    const angle = (Math.atan2(b.v - a.v, b.u - a.u) * 180) / Math.PI;
    if (s === 0) {
      startAngle = angle;
      unwrapped = 0;
    } else {
      let d = angle - prevAngle;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      unwrapped += d;
    }
    prevAngle = angle;
    out.push({ u, v, turn: unwrapped });
  }
  void startAngle;
  const endTurn = out[out.length - 1].turn;
  const rest = Math.round(endTurn / 360) * 360; // the pose at the end equals the start pose
  for (let s = 0; s <= samples; s++) {
    const p = s / samples;
    const o = out[s];
    o.turn = lerp(lerp(0, o.turn, smoothstep(0, 0.08, p)), rest, smoothstep(0.9, 1, p));
  }

  return (p: number) => {
    const x = clamp(p, 0, 1) * samples;
    const i = Math.min(Math.floor(x), samples - 1);
    const f = x - i;
    const a = out[i], b = out[i + 1];
    return { u: lerp(a.u, b.u, f), v: lerp(a.v, b.v, f), turn: lerp(a.turn, b.turn, f) };
  };
}
