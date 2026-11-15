---
videomd: 1
name: steamed-hams-4jxeuihy9ic
description: 'Made with (inferred): 2D animation 100%'
source:
  file: Steamed Hams [4jXEuIHY9ic].mp4
  sha256: 90dbb12274e075772c9870235fb3f86586263f0ae7e4aefd96e6b58f55bb0e94
  duration: 168.794
  size: 1920x1080
  fps: 23.976
  aspect: '16:9'
shots: 56
lang: en
made_mix:
  anim_2d: 1.0
confidence: 0.694
readers:
- tools
- agent
open_questions: 57
generator:
  name: rea-video
  version: 0.1.0
---

# Steamed Hams [4jXEuIHY9ic].mp4

**Verdict** (inferred): Mixed production: 2D animation 100% (100% of the duration lacks evidence for live action vs AI, to confirm); overlays: text labels, static graphics, subtitles, title (composited in code / an editor); audio: voice + 7 sound effects
**Narrative**: #01-02 set the scene → #03 grab attention → #04-05 set the scene → #06-10 turn → #11-12 add information → #13-14 turn → #15 set the mood → #16 turn → #17 add information → #18 turn → #19 add information → #20-21 set the mood → #22 add information → #23-24 turn → #25 deliver the conclusion → #26 turn → #27 add information → #28 turn → #29 add information → #30 turn → #31 add information → #32-33 set the mood → #34 turn → #35 add information → #36 turn → #37 add information → #38 show evidence → #39-40 turn → #41 set the mood → #42-43 turn → #44-47 show evidence → #48 deliver the conclusion → #49 turn → #50 deliver the conclusion → #51 turn → #52-53 deliver the conclusion → #54 set the mood → #55 deliver the conclusion → #56 set the mood
**Made with** (inferred, by duration): 2D animation 100%
**Remake**: 56 2D animation shots → 28 generation units, 28 Seedance 2.0 calls

## Next steps

- Remake: `rea-video remake <this dir>` does what can be done automatically and keeps the original elsewhere; `remake/status.md` says per shot what is left. Add incoming clips to `remake/mine.json` and run it again
- AI shots: prompts are in the generation units of `video/remake.md`; for automatic generation run `rea-video remake-plan` + `remake-run --dry-run` (paid: ask the user first)

## Open questions

- Shot #1 (0.0–1.9s): 2D animation rests on a single image reader (the tools cannot measure this class): 2D animation is easily confused with code-driven motion g…
- Shot #2 (1.9–3.0s): 2D animation rests on a single image reader (the tools cannot measure this class): 2D animation is easily confused with code-driven motion g…
- Shot #3 (3.0–6.7s): 2D animation rests on a single image reader (the tools cannot measure this class): 2D animation is easily confused with code-driven motion g…
- Shot #4 (6.7–12.0s): 2D animation rests on a single image reader (the tools cannot measure this class): 2D animation is easily confused with code-driven motion …
- Shot #5 (12.0–13.3s): 2D animation rests on a single image reader (the tools cannot measure this class): 2D animation is easily confused with code-driven motion…
- Shot #6 (13.3–13.7s): 2D animation rests on a single image reader (the tools cannot measure this class): 2D animation is easily confused with code-driven motion…
- Shot #7 (13.7–14.6s): 2D animation rests on a single image reader (the tools cannot measure this class): 2D animation is easily confused with code-driven motion…
- Shot #8 (14.6–15.6s): 2D animation rests on a single image reader (the tools cannot measure this class): 2D animation is easily confused with code-driven motion…
- 49 more, see the `flag` lines in `video/timeline.md`

## Map

Read this page first; for detail, open only the file you need. Each line is `path | ~tokens | what is in it · when to read it`; paths are relative to this directory.

```videomd-map
video/timeline.md | 5228 | Timeline: one line per shot · what a stretch says, which shots need review, how a shot was made
video/content.md | 3570 | Content and structure · what it says, the narrative line, structure, the script
video/cast.md | 605 | Cast, scenes and props · reference images for characters, first-frame prompts
video/sound.md | 611 | Sound · voice, music, sound effects, beats and sources
video/look.md | 188 | Camera, lighting and editing · for filmed shots: framing, camera, lighting, kit
video/packaging.md | 159 | Packaging · subtitles, styled text, stickers, picture-in-picture: timing and style
video/remake.md | 20331 | Remake plan · generation units, shoots, code builds, real material to collect, acting and emotion
video/shots/*.md | 589 | Per-shot detail, tokens per file on average · checking one shot: what is seen, the inference and its basis, prompts, frames
breakdown.json | 208167 | Full raw data · for programs; a model rarely needs it
shots/ | - | contact sheet, first and last frame of each shot · checking by eye
storyboard.jpg | - | storyboard of the whole video · the whole video at a glance
stems/ | - | voice, music and effects stems · listening, remaking the sound
sfx/ | - | a clip of each sound effect · finding matching effects
packaging/ | - | subtitle files, packaging timeline, sticker frames · remaking subtitles and packaging
audio.png | - | waveform and beat chart · seeing the rhythm
```

## How to read

- One shot per line: `#<n> start-end (s) | key value | …`. A key ending in `~` is the tools' inference; keys without it are visible on screen or measured directly.
- `story` job in the story and the point · `seen` what is on screen · `act` acting (emotion, strength, face) · `camera` camera move · `overlay` overlays · `made~` how it was made (inferred) · `material~` where the material came from (inferred) · `remake` remake route · `flag` needs a second look
- Full detail for a shot is in `video/shots/<n>.md` (e.g. `video/shots/07.md`).
- What is “seen” can be checked against the frames; what is “inferred” is the tools' and image readers' judgement, with the basis in each shot file. When they disagree, trust the frames.
