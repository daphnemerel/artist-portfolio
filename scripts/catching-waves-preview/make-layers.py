"""
Derived image layers for the experimental /catching-waves-preview page.

Everything comes from the work's own photos in content/works/2026-catching-waves/images/;
nothing is generated. Run from the repo root:

    pip install numpy scipy pillow opencv-python-headless
    python3 scripts/catching-waves-preview/make-layers.py

Writes to public/images/preview/:
  catching-waves-surfer.png       the green-board surfer, cut out of 01.jpg
  catching-waves-cleanplate.png   paint texture for the surfer's spot while he rides
                                  (copied from lower down the same stroke, never shown in the reveal)
  catching-waves-front-wide.png   the artist's arm and brush in front of the canvas, journey-studio.jpg
  catching-waves-front-tall.png   the same for 02.jpg
and prints the boxes that scene.ts needs.
"""

import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

SRC = "content/works/2026-catching-waves/images"
OUT = "public/images/preview"

# Painted surface of the canvas in each studio photo (detected from the turquoise, then checked).
QUADS = {
    "wide": ("journey-studio.jpg", [(905, 181), (1466, 118), (1442, 800), (889, 748)]),
    "tall": ("02.jpg", [(516, 687), (934, 638), (923, 1216), (494, 1177)]),
}
SURFER_BOX = (900, 140, 1040, 260)  # search box around the green-board surfer in 01.jpg


def turquoise(a, db=38, dg=30):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (b - r > db) & (g - r > dg)


def surfer():
    im = Image.open(f"{SRC}/01.jpg").convert("RGB")
    c = np.asarray(im.crop(SURFER_BOX)).astype(float)
    m = ~(turquoise(c) & (np.abs(c[..., 1] - c[..., 2]) < 45))
    m = ndi.binary_opening(m, iterations=1)
    lab, n = ndi.label(m)
    keep = lab == (np.argmax(ndi.sum(m, lab, range(1, n + 1))) + 1)
    keep = ndi.binary_closing(keep, iterations=1)
    hl, hn = ndi.label(ndi.binary_fill_holes(keep) & ~keep)
    for i in range(1, hn + 1):
        if (hl == i).sum() < 25:
            keep[hl == i] = True
    alpha = Image.fromarray((keep * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.7))
    bb = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
    box = (SURFER_BOX[0] + bb[0] - 2, SURFER_BOX[1] + bb[1] - 2, SURFER_BOX[0] + bb[2] + 2, SURFER_BOX[1] + bb[3] + 2)
    rgba = im.crop(SURFER_BOX).convert("RGBA")
    rgba.putalpha(alpha)
    rgba = rgba.crop((bb[0] - 2, bb[1] - 2, bb[2] + 2, bb[3] + 2))
    rgba.save(f"{OUT}/catching-waves-surfer.png", optimize=True)
    print("surfer box in 01.jpg", box, "size", rgba.size)
    return box, np.asarray(rgba)[..., 3]


def cleanplate(box, alpha_cut, offset=(50, 120)):
    A = cv2.imread(f"{SRC}/01.jpg").astype(np.float32)
    x0, y0 = box[0], box[1]
    h, w = alpha_cut.shape
    M = np.zeros(A.shape[:2], np.uint8)
    M[y0:y0 + h, x0:x0 + w] = (alpha_cut > 10).astype(np.uint8) * 255
    M = cv2.dilate(M, np.ones((5, 5), np.uint8), iterations=4)
    alpha = np.clip(cv2.GaussianBlur(M.astype(np.float32) / 255, (0, 0), 5) * 1.6, 0, 1)[..., None]
    dx, dy = offset  # along the stroke, down and to the right
    src = np.roll(np.roll(A, -dy, axis=0), -dx, axis=1)
    ring = (cv2.dilate(M, np.ones((15, 15), np.uint8)) > 0) & (M == 0)
    src = src + (A[ring].mean(0) - src[ring].mean(0))
    res = A * (1 - alpha) + src * alpha
    pad = 40
    bx0, by0, bx1, by1 = x0 - pad, y0 - pad, x0 + w + pad, y0 + h + pad
    crop = np.clip(res[by0:by1, bx0:bx1], 0, 255).astype(np.uint8)
    a8 = (alpha[by0:by1, bx0:bx1, 0] * 255).astype(np.uint8)
    cv2.imwrite(f"{OUT}/catching-waves-cleanplate.png", np.dstack([crop, a8]))
    print("cleanplate box in 01.jpg", (bx0, by0, bx1, by1))


def front(name, file, quad):
    im = Image.open(f"{SRC}/{file}").convert("RGB")
    a = np.asarray(im).astype(float)
    W, H = im.size
    qm = Image.new("L", (W, H), 0)
    ImageDraw.Draw(qm).polygon(quad, fill=255)
    q = np.asarray(qm) > 0
    qgrow = ndi.binary_dilation(q, iterations=6)
    fg = qgrow & ~turquoise(a, 30, 22)
    fg = ndi.binary_opening(fg, iterations=1)
    outside = ~ndi.binary_erosion(q, iterations=2)
    lab, _ = ndi.label(fg | (outside & ~qgrow))
    labels = set(np.unique(lab[outside & ~qgrow])) - {0}
    keep = np.isin(lab, list(labels)) & qgrow  # only what is connected to the room (the artist)
    keep = ndi.binary_fill_holes(ndi.binary_closing(keep, iterations=2)) & qgrow
    alpha = Image.fromarray((keep * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.0))
    bbox = alpha.point(lambda v: 255 if v > 4 else 0).getbbox()
    rgba = np.dstack([np.asarray(im), np.asarray(alpha)])
    rgba[rgba[..., 3] == 0] = 0  # empty pixels compress to almost nothing
    Image.fromarray(rgba, "RGBA").crop(bbox).save(f"{OUT}/catching-waves-front-{name}.png", optimize=True)
    print(f"front-{name} box in {file}", bbox)


if __name__ == "__main__":
    box, a = surfer()
    cleanplate(box, a)
    for name, (file, quad) in QUADS.items():
        front(name, file, quad)
