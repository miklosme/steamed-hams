"""Assemble the timeline from the measured pieces.

  .cache/pairs.json   (tools/camera.py)   per-frame-pair background motion
  .cache/blobs.json   (tools/track.py)    per-frame skin blobs
  timeline/shots.src.json                 shot table
  timeline/script.json (tools/align.py)   aligned dialogue
  timeline/shots/Sxx.json                 hand-annotated staging and beats (optional)

writes

  timeline/camera.json    per-frame camera for every shot that moves
  timeline/tracks.json    per-frame head / hand boxes per character
  timeline/timeline.json  the shot list tying it all together

Camera convention (2D, like a rostrum camera over cel art): each shot's first
frame is its reference picture. At frame f the camera shows the reference picture
scaled by `zoom` about the point (cx, cy), i.e. (cx, cy) is the reference point
that sits at the centre of frame f. Units: fractions of frame WIDTH, origin at the
frame centre, y down. A static shot is zoom 1, centre (0, 0) throughout.
"""
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
TL = ROOT / "timeline"
FPS = 24000 / 1001
W, H = 640, 360


def load_gray(f):
    return cv2.imread(str(ROOT / ".cache" / "frames" / f"{f:05d}.jpg"), cv2.IMREAD_GRAYSCALE)


# ---------------------------------------------------------------- camera

def camera_curve(shot, pairs):
    """Cumulative (zoom, cx, cy) per frame of the shot, or None if it never moves."""
    f0, f1 = shot["f0"], shot["f1"]
    n = f1 - f0
    if shot.get("camera") == "static":
        return None
    layer = shot.get("camera") == "layer"
    forced = set(shot.get("accept_pairs", []))
    step = np.zeros((n, 3))  # log s, tx, ty for the pair (f-1, f); row 0 unused
    state = ["still"] * n    # still | move | bad
    for k in range(1, n):
        r = pairs[f0 + k]
        if r["diff"] < 0.25 or r.get("move", 0) <= 0.35:
            continue
        ok = (r["inl"] >= 0.25 and r["n"] >= 60) if layer else (r["inl"] >= 0.35 and r["n"] >= 20)
        ok = ok or r["f"] in forced
        if ok:
            step[k] = [np.log(r["s"]), r["tx"], r["ty"]]
            state[k] = "move"
        else:
            state[k] = "bad"
    # group moving pairs into runs (gaps up to 3 frames: pans shot on twos)
    moving = [k for k in range(1, n) if state[k] == "move"]
    runs, cur = [], []
    for k in moving:
        if cur and k - cur[-1] > 4:
            runs.append(cur)
            cur = []
        cur.append(k)
    if cur:
        runs.append(cur)
    keep = np.zeros(n, bool)
    for run in runs:
        net = step[run].sum(axis=0)
        if (len(run) >= 3 or forced.issuperset(f0 + k for k in run)) and \
                (abs(net[0]) > 0.012 or np.hypot(net[1], net[2]) > 0.008):
            a, b = run[0], run[-1]
            keep[a:b + 1] = True
            # pairs inside the run that failed to solve: borrow from their neighbours
            for k in range(a, b + 1):
                if state[k] == "bad":
                    prev = max((j for j in run if j < k), default=None)
                    nxt = min((j for j in run if j > k), default=None)
                    nb = [step[j] for j in (prev, nxt) if j is not None]
                    step[k] = np.mean(nb, axis=0)
    step[~keep] = 0
    if not keep.any():
        return None
    zoom, cx, cy = np.ones(n), np.zeros(n), np.zeros(n)
    S, TX, TY = 1.0, 0.0, 0.0
    for k in range(1, n):
        s = float(np.exp(step[k, 0]))
        S, TX, TY = S * s, s * TX + step[k, 1], s * TY + step[k, 2]
        zoom[k], cx[k], cy[k] = S, -TX / S, -TY / S
    return zoom, cx, cy


def simplify(zoom, cx, cy, tol=0.004):
    """Keyframes (Ramer-Douglas-Peucker over log zoom, cx, cy) for a readable summary."""
    pts = np.stack([np.log(zoom), cx, cy], axis=1)
    keep = {0, len(pts) - 1}

    def rdp(a, b):
        if b - a < 2:
            return
        t = np.linspace(0, 1, b - a + 1)[:, None]
        line = pts[a] + (pts[b] - pts[a]) * t
        err = np.abs(pts[a:b + 1] - line).max(axis=1)
        k = int(err.argmax())
        if err[k] > tol:
            keep.add(a + k)
            rdp(a, a + k)
            rdp(a + k, b)

    rdp(0, len(pts) - 1)
    return sorted(keep)


# ---------------------------------------------------------------- setups

def setup_links(shots, pairs):
    """Which shots reuse a camera setup (same background, maybe punched in)."""
    orb = cv2.ORB_create(1500)
    bf = cv2.BFMatcher(cv2.NORM_HAMMING)
    feats = []
    for s in shots:
        g = load_gray(s["f0"])
        bgr = cv2.imread(str(ROOT / ".cache" / "frames" / f"{s['f0']:05d}.jpg"))
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        skin = cv2.dilate(cv2.inRange(hsv, (20, 120, 150), (34, 255, 255)), np.ones((21, 21), np.uint8))
        feats.append(orb.detectAndCompute(g, cv2.bitwise_not(skin)))
    parent = list(range(len(shots)))
    rel = {}

    def find(i):
        while parent[i] != i:
            i = parent[i]
        return i

    for j in range(len(shots)):
        for i in range(j):
            if shots[i]["set"] != shots[j]["set"] or find(i) != i:
                continue
            (ka, da), (kb, db) = feats[i], feats[j]
            if da is None or db is None or len(ka) < 30 or len(kb) < 30:
                continue
            m = [a for a, b in (p for p in bf.knnMatch(da, db, k=2) if len(p) == 2) if a.distance < 0.75 * b.distance]
            if len(m) < 30:
                continue
            p = np.float32([ka[x.queryIdx].pt for x in m])
            q = np.float32([kb[x.trainIdx].pt for x in m])
            M, inl = cv2.estimateAffinePartial2D(p, q, method=cv2.RANSAC, ransacReprojThreshold=2.0)
            if M is None or inl.sum() < 30 or inl.mean() < 0.5:
                continue
            s = float(np.hypot(M[0, 0], M[1, 0]))
            rot = abs(np.degrees(np.arctan2(M[1, 0], M[0, 0])))
            if not 0.4 < s < 2.5 or rot > 2:
                continue
            tx = (M[0, 0] * W / 2 + M[0, 1] * H / 2 + M[0, 2] - W / 2) / W
            ty = (M[1, 0] * W / 2 + M[1, 1] * H / 2 + M[1, 2] - H / 2) / W
            parent[j] = i
            rel[j] = {"zoom": round(s, 4), "cx": round(-tx / s, 4), "cy": round(-ty / s, 4), "matches": int(inl.sum())}
            break
    return [(find(j), rel.get(j)) for j in range(len(shots))]


# ---------------------------------------------------------------- tracks

def iou(a, b):
    x0, y0, x1, y1 = max(a[0], b[0]), max(a[1], b[1]), min(a[2], b[2]), min(a[3], b[3])
    inter = max(0, x1 - x0) * max(0, y1 - y0)
    ua = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
    return inter / ua if ua > 0 else 0


def shot_tracks(shot, blobs):
    f0, f1 = shot["f0"], shot["f1"]
    tracks, live = [], []
    for f in range(f0, f1):
        cands = list(blobs[f])
        for t in live:
            best, bi = 0.15, None
            for i, b in enumerate(cands):
                v = iou(t["last"], b["box"])
                if v > best:
                    best, bi = v, i
            if bi is not None:
                b = cands.pop(bi)
                t["frames"][f] = b
                t["last"], t["seen"] = b["box"], f
        live = [t for t in live if f - t["seen"] <= 4]
        for b in cands:
            t = {"frames": {f: b}, "last": b["box"], "seen": f}
            live.append(t)
            tracks.append(t)
    out = []
    for t in tracks:
        fr = t["frames"]
        if len(fr) < 4:
            continue
        host = sum(1.5 * b["hair"] + b["blue"] for b in fr.values()) / len(fr)
        guest = sum(b["navy"] + 0.5 * b["grey"] for b in fr.values()) / len(fr)
        who = "host" if host > max(guest, 0.15) else "guest" if guest > 0.15 else "unknown"
        a = min(fr)
        b = max(fr)
        out.append({
            "who": who, "f0": a, "f1": b + 1,
            "area": float(np.mean([x["area"] for x in fr.values()])),
            "boxes": [fr[f]["box"] if f in fr else None for f in range(a, b + 1)],
        })
    # the largest blob of each character is the head; much smaller ones are hands
    for who in ("host", "guest", "unknown"):
        mine = [t for t in out if t["who"] == who]
        if not mine:
            continue
        top = max(t["area"] for t in mine)
        for t in mine:
            t["part"] = "head" if t["area"] >= 0.45 * top and who != "unknown" else "hand_or_other"
    for t in out:
        t["area"] = round(t.pop("area"), 4)
    out.sort(key=lambda t: (t["who"], t["part"], t["f0"]))
    return out


def mouth_open(f, box, cache={}):
    """How much mouth interior (dark or red, i.e. not skin) shows in the lower part of a head box, 0..1."""
    if f not in cache:
        cache.clear()
        cache[f] = cv2.cvtColor(cv2.imread(str(ROOT / ".cache" / "frames" / f"{f:05d}.jpg")), cv2.COLOR_BGR2HSV)
    x0, y0, x1, y1 = box
    a, b, c, d = int(x0 * W), int((y0 + 0.45 * (y1 - y0)) * H), int(x1 * W), int(y1 * H)
    if c - a < 8 or d - b < 8:
        return None
    hsv = cache[f][b:d, a:c]
    inside = (hsv[..., 2] < 70) | (((hsv[..., 0] < 8) | (hsv[..., 0] > 170)) & (hsv[..., 1] > 120))
    return round(float(inside.mean()), 3)


# ---------------------------------------------------------------- main

def main():
    shots = json.loads((TL / "shots.src.json").read_text())["shots"]
    pairs = {r["f"]: r for r in json.loads((ROOT / ".cache" / "pairs.json").read_text())}
    blobs = json.loads((ROOT / ".cache" / "blobs.json").read_text())
    script = json.loads((TL / "script.json").read_text())
    setups = setup_links(shots, pairs)
    setup_name = {}
    for root, _ in setups:
        setup_name.setdefault(root, f"K{len(setup_name) + 1:02d}")

    cam_out, trk_out, tl_shots = {}, {}, []
    for i, s in enumerate(shots):
        sid, f0, f1 = s["id"], s["f0"], s["f1"]
        rec = {
            "id": sid, "f0": f0, "f1": f1, "frames": f1 - f0,
            "t0": round(f0 / FPS, 4), "t1": round(f1 / FPS, 4),
            "decomp": s["decomp"], "set": s["set"],
            "setup": setup_name[setups[i][0]],
        }
        if setups[i][1]:
            rec["setup_rel"] = setups[i][1]
        # a cut that keeps the background and only changes scale is a punch-in on the same setup
        if i:
            r = pairs[f0]
            if r["inl"] >= 0.5 and r["n"] >= 30 and r.get("move", 0) > 1:
                rec["cut_in"] = {"kind": "punch_in", "zoom": r["s"], "dx": r["tx"], "dy": r["ty"]}
                rec["setup"] = tl_shots[-1]["setup"]  # same background as the shot before
                rec.pop("setup_rel", None)
        curve = camera_curve(s, pairs)
        wall = TL / "title_wall.json"
        if s.get("camera") == "layer" and wall.exists():  # refined by tools/title_wall.py
            c = json.loads(wall.read_text())["camera"]
            curve = tuple(np.array(c[k]) for k in ("zoom", "cx", "cy"))
            rec["title_wall"] = "title_wall.json"
        if curve is None:
            rec["camera"] = {"static": True}
        else:
            zoom, cx, cy = curve
            keys = simplify(zoom, cx, cy)
            rec["camera"] = {
                "static": False,
                "keys": [{"f": f0 + k, "zoom": round(float(zoom[k]), 4), "cx": round(float(cx[k]), 4),
                          "cy": round(float(cy[k]), 4)} for k in keys],
            }
            cam_out[sid] = {"f0": f0, "zoom": [round(float(v), 4) for v in zoom],
                            "cx": [round(float(v), 4) for v in cx], "cy": [round(float(v), 4) for v in cy]}
        trk = [] if s.get("camera") == "layer" else shot_tracks(s, blobs)
        ann = TL / "shots" / f"{sid}.json"
        note = json.loads(ann.read_text()) if ann.exists() else {}
        seen = [c["who"] for c in note.get("cast", []) if c.get("screen") != "off"]
        if len(seen) == 1:  # only one character in shot: every blob is theirs
            for t in trk:
                t["who"] = seen[0]
            if trk:
                top = max(t["area"] for t in trk)
                for t in trk:
                    t["part"] = "head" if t["area"] >= 0.45 * top else "hand_or_other"
        for t in trk:
            if t["part"] == "head":
                t["mouth"] = [mouth_open(t["f0"] + k, b) if b else None for k, b in enumerate(t["boxes"])]
        trk_out[sid] = trk
        rec["cast_tracked"] = sorted({t["who"] for t in trk if t["part"] == "head"})
        rec["lines"] = [l["id"] for l in script["lines"] if l["f0"] < f1 and l["f1"] >= f0]
        # drawing changes: frames where the picture differs from the one before (animation on ones / twos)
        ch = [f for f in range(f0 + 1, f1) if pairs[f]["diff"] >= 0.25]
        rec["held_frames"] = (f1 - f0 - 1) - len(ch)
        for k in ("summary", "framing", "cast", "props", "beats", "notes", "pictures"):
            if k in note:
                rec[k] = note[k]
        tl_shots.append(rec)

    (TL / "camera.json").write_text(json.dumps({
        "note": "Per-frame camera for shots that move. zoom/cx/cy[k] is frame f0+k; see tools/build.py for the convention.",
        "shots": cam_out}))
    (TL / "tracks.json").write_text(json.dumps({
        "note": "Skin-colour tracks per shot. boxes[k] is frame f0+k: [x0, y0, x1, y1] as fractions of frame width/height, "
                "or null where the blob was lost. The box is the visible skin, not the whole head (hair is outside it). "
                "Head tracks also carry mouth[k]: how open the drawn mouth is on that frame (0 = closed; share of the "
                "lower head box showing mouth interior), read from the picture, so it follows the source's own lip timing.",
        "shots": trk_out}))
    (TL / "timeline.json").write_text(json.dumps({
        "source": {"file": "data/Steamed Hams [4jXEuIHY9ic].mp4", "fps": "24000/1001", "frames": 4047,
                   "width": 1920, "height": 1080},
        "conventions": {
            "frames": "f0 inclusive, f1 exclusive; time = frame * 1001 / 24000",
            "camera": "rostrum camera over the shot's first frame: zoom about (cx, cy), in frame widths from the "
                      "frame centre, y down; per-frame values in camera.json, 'keys' here is a simplified summary",
            "setup": "shots sharing a setup id have the same background; setup_rel places this shot's first frame "
                     "inside the setup's first shot (same convention as camera)",
            "boxes": "[x0, y0, x1, y1] as fractions of frame width / height",
        },
        "shots": tl_shots}, indent=1))
    moving = [s["id"] for s in tl_shots if not s["camera"]["static"]]
    print(len(tl_shots), "shots;", len(moving), "with camera moves:", " ".join(moving))
    print("setups:", len(setup_name), "; punch-ins:", [s["id"] for s in tl_shots if "cut_in" in s])


if __name__ == "__main__":
    main()
