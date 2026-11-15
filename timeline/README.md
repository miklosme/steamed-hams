# Timeline

Everything the three.js rebuild needs to match the reference clip frame for frame. All frame numbers are source frames at 24000/1001 fps (`time = frame × 1001 / 24000`); the clip has 4047 frames.

## Files

| File | What it holds | Made by |
|---|---|---|
| `timeline.json` | The shot list: 54 shots with frame range, set, camera setup, camera summary, dialogue line ids, and the annotated staging and beats | `tools/build.py` |
| `camera.json` | Per-frame camera (`zoom`, `cx`, `cy`) for the shots whose camera moves | `tools/build.py` |
| `tracks.json` | Per-frame head and hand boxes per character, plus how open each drawn mouth is | `tools/build.py` |
| `script.json` | Corrected dialogue with word and phoneme timing, mouth shapes, and a per-frame voice envelope | `tools/align.py` |
| `title_wall.json`, `ref/title_wall.jpg` | The title sequence: layer camera, picture rectangles, the last picture's own growth | `tools/title_wall.py` |
| `shots/Sxx.json` | Hand annotation per shot: framing, cast, props, frame-stamped beats (format in `ANNOTATING.md`) | by eye |
| `shots.src.json` | Shot table and manual overrides; input | by hand |
| `script.src.json` | Corrected transcript with a time window per line; input | by hand |

## Conventions

- **Frames**: `f0` inclusive, `f1` exclusive.
- **Roles**: `host`, `guest`, `mother` (off-screen voice), `chorus` (the jingle). The rebuild's characters are original designs, so the data never names the source characters, apart from the transcript of the original audio.
- **Boxes**: `[x0, y0, x1, y1]` as fractions of frame width and height.
- **Camera**: a 2D rostrum camera, which is how the source was shot. Each shot's first frame is its reference picture. At frame `f` the camera shows that picture scaled by `zoom` about `(cx, cy)`: the reference point that sits at the frame centre. Units are frame widths from the frame centre, y down. Static shots are zoom 1, centre (0, 0).
- **Setups**: shots with the same `setup` id share a background. `setup_rel` places a shot's first frame inside the setup's first shot, in the camera convention. `cut_in.kind = "punch_in"` marks a hard cut that only tightens the previous framing.
- **Audio sync**: times in `script.json` are when the sound is heard. In the source clip the drawn mouths run about 3 to 4 frames ahead of the voice. `tracks.json` `mouth` values come from the picture and so carry that lead; phoneme times come from the audio and do not.

## Rebuilding the data

```sh
python3 -m venv .venv
.venv/bin/pip install numpy opencv-python-headless pillow cmudict
.venv/bin/pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu128   # for align.py only

mkdir -p .cache/frames
ffmpeg -i "data/Steamed Hams [4jXEuIHY9ic].mp4" -vf scale=640:360 -q:v 3 -start_number 0 -fps_mode passthrough .cache/frames/%05d.jpg
ffmpeg -i out/steamed-hams/stems/vocals.wav -ac 1 -ar 16000 .cache/vocals16k.wav

.venv/bin/python tools/camera.py      # background motion per frame pair
.venv/bin/python tools/track.py       # skin blobs per frame
.venv/bin/python tools/align.py       # script.src.json -> script.json
.venv/bin/python tools/title_wall.py  # title sequence
.venv/bin/python tools/build.py       # everything -> timeline.json, camera.json, tracks.json
.venv/bin/python tools/check_shot.py  # validate the annotations
```

After editing a `shots/Sxx.json` or either `.src.json`, rerun the tool that reads it and then `build.py`.

## How far to trust each part

- **Cuts**: checked against an independent scene detection; exact.
- **Camera**: measured per frame from background features and confirmed by eye for every moving shot. The title-wall rectangles were overlaid on source frames and line up. Two things are not in the curves: in S03 the street background slides on its own at frames 261-276 behind a fixed door frame (it is in that shot's beats), and the last picture's rectangle is clamped rather than measured for the final 8 frames, when its border has left the screen.
- **Tracks**: skin-colour blobs. They give head position and size well; they do not give body pose, they merge when two characters overlap, and they miss a character who is tiny or seen from behind (S01, S54).
- **Dialogue**: word timing is forced alignment on the isolated voice, checked against the voice envelope. Phoneme timing inside a word is spread by rule, not measured. The four jingle lines are timed by envelope only and have no word timing.
- **Beats**: read by eye from 640×360 frames, one pass, validated for format and frame range but not second-checked. Small eye and brow changes are the least certain; a few entries say so in their text.
- **Not here**: floor plans or 3D layouts for the three rooms and the exterior. `set`, `setup`, `framing` and `props` describe each view, but the geometry is still to be designed.
