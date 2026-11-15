"""Per-frame camera solve for the reference clip.

For every consecutive frame pair, track background features and fit a
similarity transform (scale + translation). Output, per frame:

  diff   mean abs luma difference to the previous frame (0 = held drawing)
  s,tx,ty similarity mapping previous-frame pixels to this frame
          (x' = s*x + tx, in units of frame width, origin at frame centre)
  inl    RANSAC inlier ratio, n = tracked feature count

Shots marked camera "layer" in timeline/shots.src.json (the title sequence) have
a static backdrop with one layer of artwork sliding over it; there the fit uses
only the features that moved.

Reads .cache/frames/%05d.jpg (640x360), writes .cache/pairs.json.
"""
import json
import sys
from multiprocessing import Pool
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FRAMES = ROOT / ".cache" / "frames"
W, H = 640, 360


def load(i):
    return cv2.imread(str(FRAMES / f"{i:05d}.jpg"))


def skin_mask(bgr):
    """Characters are the moving part; their yellow skin is easy to exclude."""
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    m = cv2.inRange(hsv, (20, 120, 150), (34, 255, 255))
    return cv2.dilate(m, np.ones((15, 15), np.uint8))


# frames solved on the moving layer rather than the background
# (module level so that worker processes see it too)
LAYER = set()
for _sh in json.loads((ROOT / "timeline" / "shots.src.json").read_text())["shots"]:
    if _sh.get("camera") == "layer":
        LAYER.update(range(_sh["f0"] + 1, _sh["f1"]))


def solve(i):
    a, b = load(i - 1), load(i)
    ga, gb = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY), cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
    diff = float(np.mean(cv2.absdiff(ga, gb)))
    out = {"f": i, "diff": round(diff, 3), "s": 1.0, "tx": 0.0, "ty": 0.0, "inl": 1.0, "n": 0}
    if diff < 0.25:
        return out
    layer = i in LAYER
    mask = None if layer else cv2.bitwise_not(skin_mask(a))
    pts = cv2.goodFeaturesToTrack(ga, 900 if layer else 600, 0.01, 5 if layer else 6, mask=mask)
    if pts is None or len(pts) < 12:
        out["inl"] = 0.0
        return out
    nxt, st, _ = cv2.calcOpticalFlowPyrLK(ga, gb, pts, None, winSize=(25, 25), maxLevel=4)
    back, st2, _ = cv2.calcOpticalFlowPyrLK(gb, ga, nxt, None, winSize=(25, 25), maxLevel=4)
    ok = (st.ravel() == 1) & (st2.ravel() == 1) & (np.linalg.norm(pts - back, axis=2).ravel() < 0.7)
    p, q = pts[ok].reshape(-1, 2), nxt[ok].reshape(-1, 2)
    if layer:
        out["layer"] = True
        moved = np.linalg.norm(q - p, axis=1) > 0.5
        if moved.sum() < 15:  # nothing slid: the layer is at rest
            out["n"] = int(moved.sum())
            return out
        p, q = p[moved], q[moved]
    out["n"] = int(len(p))
    if len(p) < 12:
        out["inl"] = 0.0
        return out
    M, inl = cv2.estimateAffinePartial2D(p, q, method=cv2.RANSAC, ransacReprojThreshold=1.0)
    if M is None:
        out["inl"] = 0.0
        return out
    inl = inl.ravel().astype(bool)
    out["inl"] = round(float(inl.mean()), 3)
    s = float(np.hypot(M[0, 0], M[1, 0]))
    # express translation about the frame centre, in frame-width units
    cx, cy = W / 2, H / 2
    tx = (M[0, 0] * cx + M[0, 1] * cy + M[0, 2] - cx) / W
    ty = (M[1, 0] * cx + M[1, 1] * cy + M[1, 2] - cy) / W
    # median residual motion of inliers: below this the background did not move
    move = float(np.median(np.linalg.norm(q[inl] - p[inl], axis=1)))
    out["move"] = round(move, 3)
    out.update(s=round(s, 5), tx=round(float(tx), 5), ty=round(float(ty), 5))
    return out


if __name__ == "__main__":
    n = len(list(FRAMES.glob("*.jpg")))
    with Pool(24) as pool:
        rows = pool.map(solve, range(1, n), chunksize=32)
    (ROOT / ".cache" / "pairs.json").write_text(json.dumps(rows))
    print(n, "frames", file=sys.stderr)
