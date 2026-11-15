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
bun run proxy   # once: makes media/ref.mp4, a browser-friendly copy of the clip
bun run dev     # http://localhost:3000
```

The player draws the three.js scene for whatever frame the reference clip is on, with the clip (and its audio) laid over it at adjustable opacity. Right now the scene is a placeholder animatic driven by the timeline data. `?frame=N` opens on a frame; `player.seekFrame(n)` in the console does the same for scripted capture.

## Timeline data

`timeline/` holds the frame-accurate breakdown the animation is built from: shots, camera moves, character tracks, aligned dialogue and annotated beats. See `timeline/README.md`. `out/` is the earlier general-purpose breakdown it was derived from.
