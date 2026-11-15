# AGENTS.md

A meme remake: deconstruct the source clip in `data/`, then recreate it as a three.js animation.

## Source clip

- `data/Steamed Hams [4jXEuIHY9ic].mp4` is the reference: 1080p, 23.976 fps, AV1 video, Opus audio. Transcode to H.264 first when a tool fails to decode AV1.
- Treat the clip as a reference for timing, staging, and camera framing.

## Timeline

- `timeline/` is the source of truth for timing, camera and staging; read `timeline/README.md` before using or changing it.
- Frame numbers are source frames at 24000/1001 fps. The animation is driven by frame number, never by wall-clock time.
- Refer to characters by role (`host`, `guest`), not by the source characters' names.
