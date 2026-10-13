# Crops the lead photos to the canvas and corrects lighting/white balance from the wall.
# Source photos are not in the repo; paths point at the original uploads.
import numpy as np
from PIL import Image, ImageOps
U = "/root/.claude/uploads/d9986b95-2e35-5186-b2b6-d3a170b39554"

def load(f):
    return np.asarray(ImageOps.exif_transpose(Image.open(f"{U}/{f}-image.jpg")).convert("RGB")).astype(np.float32)

def wall_gains(a, strength=0.75):
    """White balance + exposure from the wall at the photo's border: the wall should be a neutral light grey."""
    b = np.concatenate([a[:60].reshape(-1, 3), a[-60:].reshape(-1, 3), a[:, :60].reshape(-1, 3), a[:, -60:].reshape(-1, 3)])
    wall = np.median(b, 0)
    target = np.full(3, 236.0)
    g = np.clip(target / wall, 0.85, 1.35)
    return 1 + (g - 1) * strength

def apply(a, g):
    out = a * g
    # gentle highlight roll-off instead of hard clipping
    out = np.where(out > 230, 230 + (out - 230) * 0.45, out)
    return np.clip(out, 0, 255)

def levels(a, lo=0.4, hi=99.6, amount=0.6):
    """Luminance stretch only (no colour change) for photos without a neutral wall."""
    y = a.mean(-1)
    p0, p1 = np.percentile(y, [lo, hi])
    s = (y - p0) / max(p1 - p0, 1) * 255
    k = np.where(y > 1, s / np.maximum(y, 1), 1)[..., None]
    return np.clip(a * (1 + (k - 1) * amount), 0, 255)

def save(a, path, crop=None):
    im = Image.fromarray(a.astype(np.uint8))
    if crop: im = im.crop(crop)
    im.thumbnail((2000, 2000), Image.LANCZOS)
    im.save(path, quality=88, optimize=True, progressive=True)
    print(path, im.size)

W = "content/works"
# (lead photo, canvas box), then the other photos of the same work
works = {
    "work-1": (("a87d01af", (148, 408, 1778, 2008)), ["4d16d0e4", "739291d4", "b488b9e4"]),
    "work-2": (("1baca1ef", (184, 448, 1685, 1975)), ["cde29afd", "81260cca", "3420d565"]),
    "work-4": (("f7b34a46", (102, 392, 1808, 2096)), ["c9122423", "e827816a", "b9407473"]),
}
for slug, ((lead, box), rest) in works.items():
    a = load(lead); g = wall_gains(a)
    print(slug, "gains", g.round(3))
    save(apply(a, g), f"{W}/{slug}/images/01.jpg", box)
    for i, f in enumerate(rest, start=2):
        b = load(f)
        has_wall = f in ("4d16d0e4", "739291d4", "b488b9e4", "cde29afd", "81260cca", "3420d565", "b9407473")
        save(apply(b, wall_gains(b) if has_wall else g), f"{W}/{slug}/images/0{i}.jpg")

# Catching Waves: the new photos (warm, peach-lit room) render the turquoise as grey. The earlier
# photo 01.jpg shows the paint's colour, so the new photos are colour-matched to it: per-channel gains
# that bring the median paint colour of new-01 to that of 01.jpg (same painting, same paint).
cw = f"{W}/2026-catching-waves/images"
def paint_median(a):
    h, w = a.shape[:2]
    return np.median(a[h // 4: 3 * h // 4, w // 4: 3 * w // 4].reshape(-1, 3), 0)
ref = paint_median(np.asarray(Image.open(f"{cw}/01.jpg").convert("RGB")).astype(np.float32))
lead = load("666a9a99")[454:2006, 184:1716]
cw_gain = ref / paint_median(lead)
print("catching waves colour gains", cw_gain.round(3))
save(apply(lead, cw_gain), f"{cw}/new-01.jpg")
for i, f in enumerate(["41e5f9f2", "0a630a29", "22c47c72", "da2d25b5", "c6d69931"], start=2):
    b = load(f)
    save(apply(b, ref / paint_median(b)), f"{cw}/new-0{i}.jpg")  # close-ups: matched on their own paint
save(load("16437a2b"), f"{cw}/new-07.jpg")  # wall view: as photographed
