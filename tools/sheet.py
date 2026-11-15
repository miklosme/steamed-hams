"""Contact sheet of reference frames, each labelled with its absolute frame number.

  python tools/sheet.py OUT.jpg START END [STEP] [COLS] [TILE_WIDTH]

END is inclusive. Frames come from .cache/frames (640x360).
"""
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FRAMES = ROOT / ".cache" / "frames"


def sheet(out, start, end, step=1, cols=6, tw=320):
    idx = list(range(start, end + 1, step))
    th = tw * 9 // 16
    rows = (len(idx) + cols - 1) // cols
    canvas = np.zeros((rows * th, cols * tw, 3), np.uint8)
    for k, f in enumerate(idx):
        im = cv2.imread(str(FRAMES / f"{f:05d}.jpg"))
        if im is None:
            continue
        im = cv2.resize(im, (tw, th), interpolation=cv2.INTER_AREA)
        cv2.rectangle(im, (0, 0), (58, 18), (0, 0, 0), -1)
        cv2.putText(im, str(f), (3, 14), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
        r, c = divmod(k, cols)
        canvas[r * th:(r + 1) * th, c * tw:(c + 1) * tw] = im
    cv2.imwrite(str(out), canvas, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return len(idx)


if __name__ == "__main__":
    a = sys.argv[1:]
    n = sheet(a[0], int(a[1]), int(a[2]), *(int(x) for x in a[3:]))
    print(f"{a[0]}: {n} frames")
