# Annotating a shot

One file per shot: `timeline/shots/Sxx.json`. It records what the measured data cannot: who is where, and what happens on which frame. `tools/build.py` merges these files into `timeline.json`.

## Looking at frames

```sh
.venv/bin/python tools/sheet.py OUT.jpg START END [STEP] [COLS] [TILE_WIDTH]
```

Writes a contact sheet of source frames `START..END` (inclusive), each tile labelled with its absolute frame number. Write sheets to a scratch directory, not into the repo. Start with every 2nd frame of the shot (`STEP` 2, 8 columns, tile width 240), then step 1 with larger tiles around anything that needs an exact frame.

Shot ranges are in `timeline/shots.src.json` (`f0` inclusive, `f1` exclusive). Dialogue timing is in `timeline/script.json`; lip movement is not annotated here.

## Format

```json
{
  "id": "S03",
  "summary": "One sentence: what the shot shows and why it is there.",
  "framing": "Shot size and angle, and how it changes if the camera moves.",
  "cast": [
    {"who": "guest", "visible": "head and shoulders", "screen": "left", "facing": "right", "costume": "navy suit"}
  ],
  "props": ["bottle with red ribbon, in guest's left hand"],
  "beats": [
    {"f": 73, "who": "guest", "action": "stands in the doorway, brows low, glances right"},
    {"f": 159, "f_end": 164, "who": "camera", "action": "whip pull-back to a two-shot"},
    {"f": 190, "who": "host", "action": "blink"}
  ],
  "hidden_cut": null,
  "notes": "Anything a rebuilder must know that fits nowhere else."
}
```

- `who`: `host` (the man hosting lunch), `guest` (his boss), `camera`, `prop`, or `fx` (smoke, fire, glow, light). Use these role names, never character names.
- `screen`: where the character sits in frame: `left`, `centre-left`, `centre`, `centre-right`, `right`, or `off` when only heard.
- `facing`: `left`, `right`, `camera`, `away`, with `3/4` if useful (`3/4 right`).
- `beats`: every change a rebuilder would have to animate, in frame order. `f` is the first frame where the new pose or state is visible; add `f_end` (last frame of the movement) for moves that take more than a few frames. Include: entrances and exits, steps, turns, head moves, gestures, hand and arm actions, prop handling, eye direction changes, brow and eyelid changes, blinks, held poses after a move, effects starting or changing, and camera moves. The first beat of each character gives their pose on the shot's first frame.
- Frame numbers are absolute source frames and must lie inside the shot.
- `hidden_cut`: a frame number if the shot contains a cut the shot table missed, else `null`.
- Describe what is drawn, plainly. No interpretation of plot beyond `summary`.

Check the file before finishing:

```sh
.venv/bin/python tools/check_shot.py S03
```
