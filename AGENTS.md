# AGENTS.md

A meme remake: deconstruct the source clip in `data/`, then recreate it as a three.js animation.

## Source clip

- `data/Steamed Hams [4jXEuIHY9ic].mp4` is the reference: 1080p, 23.976 fps, AV1 video, Opus audio. Transcode to H.264 first when a tool fails to decode AV1.
- Treat the clip as a reference for timing, staging, and camera framing.

## Timeline

- `timeline/` is the source of truth for timing, camera and staging; read `timeline/README.md` before using or changing it.
- Frame numbers are source frames at 24000/1001 fps. The animation is driven by frame number, never by wall-clock time.
- Refer to characters by role (`host`, `guest`), not by the source characters' names.

## Animation

- Staging lives in `src/shots/`; read `src/shots/README.md` before adding or changing a shot or stage.
- Check a change with `bun tools/shoot.ts OUT.jpg Sxx` (reference against render) and `bunx tsc --noEmit`. Write comparison sheets to a scratch directory.
- Headless capture uses software GL on purpose: the GPU path dropped meshes at random on the machine this was built on. `GLARGS` overrides the Chrome flags.

## AI CLI

- `bun run --silent ai <cmd>` runs Vercel's `ai-cli` (`text`, `image`, `video`, `audio`, `decide`, `models`) with `AI_GATEWAY_API_KEY` loaded from `.env`. `ai --help` lists flags.
- Piped text goes to stdout (`git diff | bun run --silent ai text "explain"`); otherwise output is saved in the current directory, so pass `-o media/ai/` (gitignored) for generated media.
- `.mcp.json` exposes the same CLI as an MCP server named `ai`.
