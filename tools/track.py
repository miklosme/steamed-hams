"""Per-frame character tracking for the reference clip, by skin colour.

Both characters share one flat skin yellow, so heads and hands segment cleanly.
Per frame: connected skin blobs -> bbox, with cues for which character it is
(hair above the blob, suit colour below it) and whether it is a head (eye whites
inside it). Blobs are then linked across frames into tracks, per shot.

Reads .cache/frames, writes .cache/blobs.json (raw per-frame blobs).
Boxes are [x0, y0, x1, y1] as fractions of frame width / height.
"""
import json
from multiprocessing import Pool
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FRAMES = ROOT / ".cache" / "frames"
W, H = 640, 360
MIN_AREA = 0.004  # of the frame


def masks(bgr):
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    skin = cv2.inRange(hsv, (21, 130, 170), (32, 255, 255))
    white = cv2.inRange(hsv, (0, 0, 205), (179, 45, 255))
    navy = cv2.inRange(hsv, (105, 120, 40), (125, 255, 150))      # guest's suit
    blue = cv2.inRange(hsv, (92, 60, 110), (106, 170, 200))       # host's suit
    hair = cv2.inRange(hsv, (12, 40, 80), (30, 110, 160))         # host's grey-brown hair
    grey = cv2.inRange(hsv, (0, 0, 130), (40, 40, 200))           # guest's grey side hair
    return skin, white, navy, blue, hair, grey


def frac(mask, x0, y0, x1, y1):
    x0, y0, x1, y1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
    if x1 <= x0 or y1 <= y0:
        return 0.0
    return float(mask[y0:y1, x0:x1].mean() / 255)


def blobs(i):
    bgr = cv2.imread(str(FRAMES / f"{i:05d}.jpg"))
    skin, white, navy, blue, hair, grey = masks(bgr)
    skin = cv2.morphologyEx(skin, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    # close small gaps (mouth lines, eyes) so a head stays one blob
    closed = cv2.morphologyEx(skin, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, stats, cent = cv2.connectedComponentsWithStats(closed, 8)
    out = []
    for k in range(1, n):
        x, y, w, h, area = stats[k]
        if area < MIN_AREA * W * H:
            continue
        comp = (lab == k).astype(np.uint8)
        hull_pts = cv2.findNonZero(comp)
        hull = cv2.convexHull(hull_pts)
        hm = np.zeros((H, W), np.uint8)
        cv2.fillConvexPoly(hm, hull, 255)
        eye = float(((white > 0) & (hm > 0)).sum() / max(1, (hm > 0).sum()))
        out.append({
            "box": [round(x / W, 4), round(y / H, 4), round((x + w) / W, 4), round((y + h) / H, 4)],
            "area": round(float(area) / (W * H), 4),
            "eye": round(eye, 3),
            # cue strips: just above the blob (hair), around it (side hair), below it (suit)
            "hair": round(frac(hair, x, y - h // 3, x + w, y + h // 6), 3),
            "grey": round(frac(grey, x - w // 3, y, x + w + w // 3, y + h), 3),
            "navy": round(frac(navy, x - w // 4, y + h, x + w + w // 4, y + h + h // 2), 3),
            "blue": round(frac(blue, x - w // 4, y + h, x + w + w // 4, y + h + h // 2), 3),
        })
    out.sort(key=lambda b: -b["area"])
    return out[:8]


if __name__ == "__main__":
    n = len(list(FRAMES.glob("*.jpg")))
    with Pool(24) as pool:
        rows = pool.map(blobs, range(n), chunksize=32)
    (ROOT / ".cache" / "blobs.json").write_text(json.dumps(rows))
    print(n, "frames,", sum(len(r) for r in rows), "blobs")
