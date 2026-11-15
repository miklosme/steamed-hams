# Steamed Hams

My own take on the Steamed Hams meme: a shot-by-shot breakdown of the original clip, rebuilt as a three.js animation with original characters.

## Setup

Requires [Bun](https://bun.sh).

```sh
bun install
```

The reference clip lives in `data/`.

## Player

```sh
bun run proxy   # once: makes media/ref.mp4 and media/audio.m4a, browser-friendly copies of the clip
bun run dev     # http://localhost:3000
```

The original soundtrack (`media/audio.m4a`) is the clock: the player draws the three.js animation for whatever frame the sound is on, so the two stay locked. The reference picture is hidden by default; raise "Reference" (or press `o`) to lay it over the animation and compare. `?frame=N` opens on a frame.

## Rendering a video

```sh
bun run render                       # out/animation.mp4: 1920x1080, 23.976 fps, original audio
bun run render out/cut.mp4 --from 1686 --to 2007 --width 1280
```

Frames are drawn one at a time from the frame number in headless Chrome and piped to ffmpeg, so the file is frame-exact against the source clip: use it as the control video for a video-to-video model. Needs Chrome (`CHROME=/path` to override) and ffmpeg.

## How the animation is built

- `src/engine.ts` draws one frame: picks the shot, applies the measured camera move, anchors each character's head to its measured track, poses the rig from the shot's keys, and opens mouths from the aligned dialogue.
- `src/rig.ts` is the character, `src/pieces.ts` the set pieces, props and effects, `src/stage.ts` the per-setup camera and placement maths.
- `src/shots/` holds the staging, one file per group of shots. `src/shots/README.md` is the authoring guide, including `bun run shoot`, which writes reference-against-render comparison sheets.

## Timeline data

`timeline/` holds the frame-accurate breakdown the animation is built from: shots, camera moves, character tracks, aligned dialogue and annotated beats. See `timeline/README.md`. `out/` is the earlier general-purpose breakdown it was derived from.
