"""Break down the title sequence (the shot marked camera "layer").

Staging, as measured: a static wallpaper backdrop; one rigid layer of framed
pictures that the camera pulls back from and then pans along; and the last
picture, which additionally grows on its own until it fills the frame.

writes timeline/title_wall.json
         layer camera per frame (same convention as camera.json; reference
         picture = the first frame, where the title card fills the screen)
         picture rectangles in layer coordinates
         per-frame screen rectangle of the last picture while it grows
         frame range in which each picture's rectangle overlaps the frame
         (geometry only: a picture can still be hidden behind a neighbour)
       timeline/ref/title_wall.jpg   panorama of the picture layer
"""
import json
from pathlib import Path

import cv2
import numpy as np

import build

ROOT = Path(__file__).resolve().parent.parent
W, H = 640, 360
GROW_FROM = 1090   # the last picture is still rigid with the layer here
P = 380            # panorama pixels per layer unit

# picture rectangles read off the panorama (pixels), then snapped to the wood border
GUESS = {"title_card": (192, 583, 220, 440), "P2": (508, 920, 84, 312), "P3": (858, 1268, 208, 436),
         "P4": (1211, 1623, 84, 311), "P5": (1558, 1962, 208, 436), "P6": (1890, 2250, 88, 292)}


def frame(f):
    return cv2.imread(str(ROOT / ".cache" / "frames" / f"{f:05d}.jpg"))


def flow(a, b, mask):
    ga, gb = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY), cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
    pts = cv2.goodFeaturesToTrack(ga, 900, 0.01, 5, mask=mask)
    if pts is None:
        return np.zeros((0, 2)), np.zeros((0, 2))
    nxt, st, _ = cv2.calcOpticalFlowPyrLK(ga, gb, pts, None, winSize=(25, 25), maxLevel=4)
    back, st2, _ = cv2.calcOpticalFlowPyrLK(gb, ga, nxt, None, winSize=(25, 25), maxLevel=4)
    ok = (st.ravel() == 1) & (st2.ravel() == 1) & (np.linalg.norm(pts - back, axis=2).ravel() < 0.7)
    return pts[ok].reshape(-1, 2), nxt[ok].reshape(-1, 2)


def fit(p, q):
    if len(p) < 12:
        return None
    M, inl = cv2.estimateAffinePartial2D(p, q, method=cv2.RANSAC, ransacReprojThreshold=1.0)
    if M is None or inl.sum() < 10:
        return None
    return float(np.hypot(M[0, 0], M[1, 0])), float(M[0, 2]), float(M[1, 2]), M


def snap(bgr, rect, aspect):
    """Pull the predicted picture rectangle onto its wood border where that is on screen."""
    wood = cv2.inRange(cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV), (8, 120, 120), (20, 255, 230))
    xa, ya, xb, yb = rect
    ys = slice(int(max(0, ya + 12)), int(min(H, yb - 12)))
    xs = slice(int(max(0, xa + 12)), int(min(W, xb - 12)))

    def best(lo, hi, cover, outer_first):
        hits = [v for v in range(max(0, int(lo)), int(hi)) if cover(v) > 0.6]
        return (min(hits) if outer_first else max(hits)) if hits else None

    left = best(xa - 14, min(W, xa + 14), lambda x: wood[ys, x].mean() / 255, True) if xa > 2 else None
    top = best(ya - 14, min(H, ya + 14), lambda y: wood[y, xs].mean() / 255, True) if ya > 2 else None
    bot = best(yb - 14, min(H, yb + 14), lambda y: wood[y, xs].mean() / 255, False) if yb < H - 2 else None
    if left is not None:
        xb += left - xa
        xa = left
    if top is not None and bot is not None:
        ya, yb = top, bot + 1
        xb = xa + (yb - ya) * aspect
    elif top is not None:
        yb += top - ya
        ya = top
    if wood.mean() / 255 < 0.003:  # no border left on screen: the picture covers the frame
        xa, ya, xb, yb = min(xa, -0.02 * W), min(ya, -0.02 * H), max(xb, 1.02 * W), max(yb, 1.02 * H)
    return np.array([xa, ya, xb, yb], float)


def main():
    shots = json.loads((ROOT / "timeline" / "shots.src.json").read_text())["shots"]
    shot = next(s for s in shots if s.get("camera") == "layer")
    f0, f1 = shot["f0"], shot["f1"]
    pairs = {r["f"]: r for r in json.loads((ROOT / ".cache" / "pairs.json").read_text())}
    zoom, cx, cy = build.camera_curve(shot, pairs)

    def to_screen(k, x, y):  # layer coords -> pixels of frame f0+k
        return (zoom[k] * (x - cx[k])) * W + W / 2, (zoom[k] * (y - cy[k])) * W + H / 2

    # panorama of the layer, from the frames where everything is still rigid
    lo = int(np.argmax(zoom < 0.6))
    ks = range(lo, GROW_FROM - f0, 2)
    x0 = min(cx[k] - 0.5 / zoom[k] for k in ks) - 0.05
    y0 = min(cy[k] - 0.2813 / zoom[k] for k in ks) - 0.05
    pw = int((max(cx[k] + 0.5 / zoom[k] for k in ks) + 0.05 - x0) * P)
    ph = int((max(cy[k] + 0.2813 / zoom[k] for k in ks) + 0.05 - y0) * P)
    pano = np.zeros((ph, pw, 3), np.uint8)
    for k in ks:
        s = P / (zoom[k] * W)
        M = np.float32([[s, 0, (cx[k] - x0) * P - s * W / 2], [0, s, (cy[k] - y0) * P - s * H / 2]])
        wp = cv2.warpAffine(frame(f0 + k), M, (pw, ph))
        mk = cv2.warpAffine(np.full((H, W), 255, np.uint8), M, (pw, ph))
        pano[mk > 0] = wp[mk > 0]
    wood = cv2.inRange(cv2.cvtColor(pano, cv2.COLOR_BGR2HSV), (8, 120, 120), (20, 255, 230))
    # GUESS was read off a panorama whose origin differs slightly: re-anchor on the title card
    ref_x0, ref_y0 = -1.0137, -0.8629
    pictures = []
    for name, (a, b, c, d) in GUESS.items():
        a, b = (int((v / P + ref_x0 - x0) * P) for v in (a, b))
        c, d = (int((v / P + ref_y0 - y0) * P) for v in (c, d))

        def col(x):
            return wood[c + 10:d - 10, x].mean() / 255 if 0 <= x < pw else 0

        def row(y):
            return wood[y, a + 10:min(b, pw) - 10].mean() / 255 if 0 <= y < ph else 0

        L = min((x for x in range(a - 15, a + 15) if col(x) > 0.5), default=a)
        R = max((x for x in range(b - 15, b + 15) if col(x) > 0.5), default=b)
        T = min((y for y in range(c - 15, c + 15) if row(y) > 0.5), default=c)
        B = max((y for y in range(d - 15, d + 15) if row(y) > 0.5), default=d)
        pictures.append({"id": name, "rect": [round(L / P + x0, 4), round(T / P + y0, 4),
                                               round((R + 1) / P + x0, 4), round((B + 1) / P + y0, 4)]})
        cv2.rectangle(pano, (L, T), (R, B), (0, 255, 0), 1)
        cv2.putText(pano, name, (L + 8, T + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    (ROOT / "timeline" / "ref").mkdir(exist_ok=True)
    cv2.imwrite(str(ROOT / "timeline" / "ref" / "title_wall.jpg"), pano)

    # from GROW_FROM on, solve the last picture and the rest of the layer separately
    k0 = GROW_FROM - f0
    last = pictures[-1]["rect"]
    xa, ya = to_screen(k0, last[0], last[1])
    xb, yb = to_screen(k0, last[2], last[3])
    rect = np.array([xa, ya, xb, yb])
    aspect = (xb - xa) / (yb - ya)
    grow = [rect.copy()]
    vel = np.array([np.log(zoom[k0] / zoom[k0 - 1]), 0, 0])
    S, TX, TY = zoom[k0], -cx[k0] * zoom[k0], -cy[k0] * zoom[k0]
    # steady pan speed just before, used when the layer is hidden behind the growing picture
    pan = np.mean([[pairs[f]["tx"], pairs[f]["ty"]] for f in range(GROW_FROM - 40, GROW_FROM) if pairs[f].get("move", 0) > 1], axis=0)
    for k in range(k0 + 1, f1 - f0):
        a, b = frame(f0 + k - 1), frame(f0 + k)
        x_a, y_a, x_b, y_b = rect
        inside = np.zeros((H, W), np.uint8)
        cv2.rectangle(inside, (int(max(0, x_a - 4)), int(max(0, y_a - 4))), (int(min(W, x_b + 4)), int(min(H, y_b + 4))), 255, -1)
        outside = np.full((H, W), 255, np.uint8)
        cv2.rectangle(outside, (int(x_a - 10), int(y_a - 10)), (int(x_b + 10), int(y_b + 10)), 0, -1)
        # the picture
        p, q = flow(a, b, inside)
        got = fit(p, q)
        if got:
            M = got[3]
            c1 = M @ np.array([x_a, y_a, 1])
            c2 = M @ np.array([x_b, y_b, 1])
            new = np.array([c1[0], c1[1], c2[0], c2[1]])
            vel = new - rect
            rect = new
        else:
            rect = rect + vel if vel.shape == (4,) else rect
        rect = snap(b, rect, aspect)
        grow.append(rect.copy())
        # the layer behind it
        p, q = flow(a, b, outside)
        moved = np.linalg.norm(q - p, axis=1) > 0.5 if len(p) else np.zeros(0, bool)
        got = fit(p[moved], q[moved]) if moved.sum() >= 40 else None
        if got and abs(np.log(got[0])) < 0.01:
            M = got[3]
            tx = (M[0, 0] * W / 2 + M[0, 1] * H / 2 + M[0, 2] - W / 2) / W
            ty = (M[1, 0] * W / 2 + M[1, 1] * H / 2 + M[1, 2] - H / 2) / W
        else:
            tx, ty = (pan if pairs[f0 + k]["diff"] >= 0.25 and rect[0] > 0 else (0.0, 0.0))
        TX, TY = TX + tx, TY + ty
        zoom[k], cx[k], cy[k] = S, -TX / S, -TY / S

    def on_screen(pic):
        vis = []
        for k in range(f1 - f0):
            if pic["id"] == pictures[-1]["id"] and k >= k0:
                xa, ya, xb, yb = grow[k - k0]
            else:
                xa, ya = to_screen(k, pic["rect"][0], pic["rect"][1])
                xb, yb = to_screen(k, pic["rect"][2], pic["rect"][3])
            if min(xb, W) - max(xa, 0) >= 1 and min(yb, H) - max(ya, 0) >= 1:
                vis.append(f0 + k)
        return vis

    for pic in pictures:
        vis = on_screen(pic)
        pic["in_frame"] = [vis[0], vis[-1] + 1] if vis else None
    out = {
        "note": "Title sequence. Static wallpaper; one rigid layer of framed pictures; the camera (below) pulls back "
                "from the title card and pans right along the layer. Rects are in layer coordinates: frame widths, "
                "origin at the centre of the first frame, y down. The last picture grows independently from "
                f"frame {GROW_FROM}: use 'last_picture_screen' for it from then on.",
        "shot": shot["id"], "f0": f0, "f1": f1,
        "camera": {"zoom": [round(float(v), 4) for v in zoom], "cx": [round(float(v), 4) for v in cx],
                   "cy": [round(float(v), 4) for v in cy]},
        "pictures": pictures,
        "last_picture_screen": {
            "note": "[x0, y0, x1, y1] as fractions of frame width / height; may extend past the frame",
            "f0": GROW_FROM,
            "rects": [[round(float(r[0] / W), 4), round(float(r[1] / H), 4), round(float(r[2] / W), 4),
                       round(float(r[3] / H), 4)] for r in grow],
        },
    }
    (ROOT / "timeline" / "title_wall.json").write_text(json.dumps(out))
    for pic in pictures:
        print(pic)
    for k in (0, 1, 20, 40, 55, 60, 70, 80, 86, 89):
        print(GROW_FROM + k, out["last_picture_screen"]["rects"][k], round(float(cx[k0 + k]), 3))


if __name__ == "__main__":
    main()
