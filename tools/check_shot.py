"""Validate timeline/shots/Sxx.json files. Usage: check_shot.py [S03 S04 ...] (default: all)."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WHO = {"host", "guest", "camera", "prop", "fx"}


def check(sid, shot):
    path = ROOT / "timeline" / "shots" / f"{sid}.json"
    if not path.exists():
        return [f"{sid}: missing"]
    try:
        a = json.loads(path.read_text())
    except json.JSONDecodeError as e:
        return [f"{sid}: invalid JSON ({e})"]
    errs = []
    if a.get("id") != sid:
        errs.append("id does not match the file name")
    for k in ("summary", "framing", "cast", "props", "beats"):
        if k not in a:
            errs.append(f"missing '{k}'")
    for c in a.get("cast", []):
        if c.get("who") not in ("host", "guest"):
            errs.append(f"cast who '{c.get('who')}' must be host or guest")
        for k in ("visible", "screen", "facing"):
            if not c.get(k):
                errs.append(f"cast {c.get('who')}: missing '{k}'")
    last = shot["f0"]
    beats = a.get("beats", [])
    if not beats:
        errs.append("no beats")
    for b in beats:
        f = b.get("f")
        if not isinstance(f, int) or not shot["f0"] <= f < shot["f1"]:
            errs.append(f"beat frame {f} outside the shot ({shot['f0']}..{shot['f1'] - 1})")
            continue
        if f < last:
            errs.append(f"beat at {f} is out of order")
        last = f
        fe = b.get("f_end")
        if fe is not None and not (isinstance(fe, int) and f <= fe < shot["f1"]):
            errs.append(f"beat at {f}: f_end {fe} must be within the shot and not before f")
        if b.get("who") not in WHO:
            errs.append(f"beat at {f}: who '{b.get('who')}' not one of {sorted(WHO)}")
        if not b.get("action"):
            errs.append(f"beat at {f}: missing action")
    hc = a.get("hidden_cut")
    if hc is not None and not (isinstance(hc, int) and shot["f0"] < hc < shot["f1"]):
        errs.append("hidden_cut must be null or a frame inside the shot")
    return [f"{sid}: {e}" for e in errs]


if __name__ == "__main__":
    shots = {s["id"]: s for s in json.loads((ROOT / "timeline" / "shots.src.json").read_text())["shots"]}
    ids = sys.argv[1:] or list(shots)
    errs = [e for sid in ids for e in check(sid, shots[sid])]
    print("\n".join(errs) if errs else f"ok ({len(ids)} shots)")
    sys.exit(1 if errs else 0)
