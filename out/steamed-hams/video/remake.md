---
videomd: 1
part: remake
tokens: 20319
---

## Remake plan

### Step by step

This is a 3D / animation. Every number in the steps below was measured on the original; follow them and check yours against it.

1. **Write the content**: the original runs in 39 steps (the narrative line under “Content and structure”); write yours in the same order and timing
2. **Collect material**: one reference image per character, the same one in every shot: Skinner (the host, 'Seymour'), Chalmers (the superintendent), The host's mother (voice only)
3. **Generate**: 28 generation units, 28 calls to Seedance 2.0; each unit's prompt, input images and how it joins the last are under “AI generation” below. Paste them into the model's web page by hand, or have the agent run them through capsule-cinema (paid per call; it does a dry run first to show the jobs and cost)
4. **Voice**: the original is TTS voice-over; 53 lines in the script table under “Sound”, with the pace and pauses of each; delivery per “Acting and emotion”
5. **Edit**: follow the order and lengths in the shot list; the original has 56 shots at 3.0s each; 8 transitions are not hard cuts, see “Edit” below
6. **Subtitles and styled text**: timing and style under “Packaging layer”
7. **Sound effects**: 7, with the time and the picture event each one hits under “Sound”; each can be played first
8. **Put it together and compare**: hand the shots you made to the agent; `rea-video remake` places them on the original timeline, keeps the original where yours are missing, and renders a side-by-side comparison with the original

**56 2D animation shots → 28 generation units, 28 Seedance 2.0 calls**

- Grouping: AI shots in the same scene joined by hard cuts are generated in one call; ≤15s per call; consecutive hard cuts inside a unit preferably ≤8s, at most 10s; split at dissolves / fades and scene changes
- Audio: the model can generate action sound effects and ambience along with the picture; voice-over is better done as separate TTS and mixed in, so copy and timing stay editable
- The prompts below are written generically; before generating with Seedance 2.0, rewrite them the way it expects (timing and shots, how references are addressed, dialogue, exclusions): `rea-video models seedance-2.0`

A video model can take these inputs; each generation unit below lists which ones to feed and where they come from:
- **Text prompt**: always; describes the picture, action and camera
- **First frame**: locks the composition and subject of frame one. Without it this is plain text-to-video and framing changes every time
- **Last frame**: also locks the final frame so the model only fills in between. Suits a single shot with a camera move or action
- **Reference images**: how the product and people look, so they stay the same across shots (`@图片1` in the prompt)
- **Reference video**: copy the action, camera move and rhythm, not the picture (`@视频1`); not every model takes one

### Generation units

One generation per unit. The table lists what to feed the model; open a unit for where each input comes from and the prompt.

| Unit | Shots | Time | Duration | Mode | Feed | Continuity |
|---|---|---|---|---|---|---|
| G1 | #1 | 0.0–1.9s | 1.9s | single shot | first frame + reference image + reference video | — |
| G2 | #2 | 1.9–3.0s | 1.1s | single shot | first frame + reference image + reference video | — |
| G3 | #3 | 3.0–6.7s | 3.7s | single shot | first frame + reference image + reference video | — |
| G4 | #4 | 6.7–12.0s | 5.3s | single shot | first frame + reference image + reference video | — |
| G5 | #5 | 12.0–13.3s | 1.3s | single shot | first frame + reference image + reference video | — |
| G6 | #6–#8 | 13.3–15.6s | 2.3s | multi-shot | first frame + reference image + reference video | — |
| G7 | #9–#10 | 15.6–20.2s | 4.6s | multi-shot | first frame + reference image + reference video | — |
| G8 | #11 | 20.2–30.8s | 10.6s | single shot | first frame + reference image + reference video | — |
| G9 | #12–#14 | 30.8–34.4s | 3.6s | multi-shot | first frame + reference image + reference video | first frame = last frame of G8, continue the action |
| G10 | #15 | 34.4–49.2s | 14.8s | single shot | first frame + reference image + reference video | — |
| G11 | #16–#18 | 49.2–57.8s | 8.6s | multi-shot | first frame + reference image + reference video | — |
| G12 | #19 | 57.8–65.1s | 7.3s | single shot | first frame + reference image + reference video | first frame = last frame of G11, continue the action |
| G13 | #20–#22 | 65.1–70.3s | 5.3s | multi-shot | first frame + reference image + reference video | first frame = last frame of G12, continue the action |
| G14 | #23–#24 | 70.3–76.9s | 6.5s | multi-shot | first frame + reference image + reference video | — |
| G15 | #25–#26 | 76.9–83.7s | 6.8s | multi-shot | first frame + reference image + reference video | first frame = last frame of G14, continue the action |
| G16 | #27–#29 | 83.7–89.5s | 5.8s | multi-shot | first frame + reference image + reference video | first frame = last frame of G15, continue the action |
| G17 | #30–#31 | 89.5–97.2s | 7.7s | multi-shot | first frame + reference image + reference video | first frame = last frame of G16, continue the action |
| G18 | #32–#34 | 97.2–103.7s | 6.5s | multi-shot | first frame + reference image + reference video | first frame = last frame of G17, continue the action |
| G19 | #35–#36 | 103.7–111.5s | 7.8s | multi-shot | first frame + reference image + reference video | first frame = last frame of G18, continue the action |
| G20 | #37–#38 | 111.5–116.2s | 4.6s | multi-shot | first frame + reference image + reference video | first frame = last frame of G19, continue the action |
| G21 | #39 | 116.2–123.5s | 7.3s | single shot | first frame + reference image + reference video | first frame = last frame of G20, continue the action |
| G22 | #40 | 123.5–131.2s | 7.7s | single shot | first frame + reference image + reference video | — |
| G23 | #41–#42 | 131.2–136.5s | 5.3s | multi-shot | first frame + reference image + reference video | first frame = last frame of G22, continue the action |
| G24 | #43–#46 | 136.5–143.7s | 7.3s | multi-shot | first frame + reference image + reference video | first frame = last frame of G23, continue the action |
| G25 | #47–#50 | 143.7–151.1s | 7.4s | multi-shot | first frame + reference image + reference video | first frame = last frame of G24, continue the action |
| G26 | #51 | 151.1–156.7s | 5.5s | single shot | first frame + reference image + reference video | — |
| G27 | #52 | 156.7–161.7s | 5.0s | single shot | first frame + reference image + reference video | first frame = last frame of G26, continue the action |
| G28 | #53–#56 | 161.7–168.8s | 7.1s | multi-shot | first frame + reference image + reference video | first frame = last frame of G27, continue the action |

**G1 · shots #1 · 1.9s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | source frame `shots/shot_001_first.jpg` (to change product, person or style, redraw it with an image model from the first-frame prompt below); this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | locks composition, shot size and subject position; with text alone every generation frames it differently |
| last frame | no | — | this unit uses references to keep the product and people; the model takes no last frame alongside them |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 0.0–1.9s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Generate 4s and trim to 1.9s (very short shots are unstable when generated on their own)
- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1.
Wide exterior establishing shot of a two-storey suburban house; a small figure in a blue suit (Chalmers) stands at the front door and rings the bell. Locked-off camera.
```

**G2 · shots #2 · 1.1s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | source frame `shots/shot_002_first.jpg` (to change product, person or style, redraw it with an image model from the first-frame prompt below); this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | locks composition, shot size and subject position; with text alone every generation frames it differently |
| last frame | no | — | this unit uses references to keep the product and people; the model takes no last frame alongside them |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 1.9–3.0s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Generate 4s and trim to 1.1s (very short shots are unstable when generated on their own)
- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #2: nervous (light) · eyes wide, mouth closed (expression in the first frame, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1.
Interior, medium shot: Skinner in a white apron over a blue suit walks left to a purple front door and opens it; the visitor's dark suit appears in the gap. Static camera.Acting (very subtle, barely visible): eyes wide, mouth closed; walks to the door, hand on the knob
```

**G3 · shots #3 · 3.7s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | source frame `shots/shot_003_first.jpg` (to change product, person or style, redraw it with an image model from the first-frame prompt below); this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | locks composition, shot size and subject position; with text alone every generation frames it differently |
| last frame | no | — | this unit uses references to keep the product and people; the model takes no last frame alongside them |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 3.0–6.7s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #3: annoyed (light) · half-lidded eyes, brow low, speaks through clenched teeth (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1.
Close-up of Chalmers in the doorway against the street of houses. Line: 'Well, Seymour, I made it, despite your directions.'. Acting (very subtle, barely visible): half-lidded eyes, brow low, speaks through clenched teeth; head still, body square to the door
```

**G4 · shots #4 · 5.3s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | source frame `shots/shot_004_first.jpg` (to change product, person or style, redraw it with an image model from the first-frame prompt below); this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | locks composition, shot size and subject position; with text alone every generation frames it differently |
| last frame | no | — | this unit uses references to keep the product and people; the model takes no last frame alongside them |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 6.7–12.0s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #4: eager (medium) · wide eyes, big open smile, eyebrows up (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1.
Two-shot on the doorstep: Chalmers holds a bottle tied with a red ribbon; Skinner in apron greets him ('Ah, Superintendent Chalmers, welcome! I hope you're prepared for an unforgettable luncheon'); Chalmers grunts and walks in past him.Acting (moderate, not exaggerated): wide eyes, big open smile, eyebrows up; leans toward the guest, then steps aside
```

**G5 · shots #5 · 1.3s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | source frame `shots/shot_005_first.jpg` (to change product, person or style, redraw it with an image model from the first-frame prompt below); this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | locks composition, shot size and subject position; with text alone every generation frames it differently |
| last frame | no | — | this unit uses references to keep the product and people; the model takes no last frame alongside them |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 12.0–13.3s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Generate 4s and trim to 1.3s (very short shots are unstable when generated on their own)
- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #5: calm (light) · neutral (expression in the first frame, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1.
Dining room, wide: table with white cloth and ice bucket, framed picture on the wall. Chalmers puts the bottle in the bucket and sits; Skinner slips out through the kitchen door in the background.Acting (very subtle, barely visible): neutral; sets bottle in bucket, pulls out chair and sits
```

**G6 · shots #6–#8 · 2.3s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | source frame `shots/shot_006_first.jpg` (to change product, person or style, redraw it with an image model from the first-frame prompt below); this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | locks composition, shot size and subject position; with text alone every generation frames it differently |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 13.3–15.6s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Generate 4s and trim to 2.3s (very short shots are unstable when generated on their own)
- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #8 (key): shock (strong) · eyes shut then pop wide, mouth drops open (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–0.4s): Insert: Skinner's arm pushes the kitchen door open and the kitchen comes into view with grey smoke rising from the stove under the window.
Shot 2 (0.4–1.3s): Insert on the white oven, smoke pouring from the top and door seams. No characters.
Shot 3 (1.3–2.3s): Close-up reaction: Skinner's eyes close, then snap wide with an open-mouthed gasp; he darts out of the right edge of frame.Acting (openly expressed, features stay natural): eyes shut then pop wide, mouth drops open; freezes, then bolts out of frame
```

**G7 · shots #9, #10 · 4.6s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | source frame `shots/shot_009_first.jpg` (to change product, person or style, redraw it with an image model from the first-frame prompt below); this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | locks composition, shot size and subject position; with text alone every generation frames it differently |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 15.6–20.2s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #9 (key): dismay (strong) · wide eyes fixed on the roast, mouth open (voice first, then drive, see “Acting and emotion”)
- Acting #10: anxious (medium) · brow knotted, eyes darting (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–2.1s): Point of view from inside the oven: black frame, the door opens, Skinner's face peers in through smoke at the roast, which bursts into flames. Line: 'Oh, egads! My roast is ruined!'. Acting (openly expressed, features stay natural): wide eyes fixed on the roast, mouth open; leaning in to the oven
Shot 2 (2.1–4.6s): Kitchen medium shot: Skinner beside the smoking stove claps a hand to his head, bites his nails, then turns to the window. Line: 'But what if...'. Acting (moderate, not exaggerated): brow knotted, eyes darting; hand on head, then fingers to mouth, turns to window
```

**G8 · shots #11 · 10.6s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | source frame `shots/shot_011_first.jpg` (to change product, person or style, redraw it with an image model from the first-frame prompt below); this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | locks composition, shot size and subject position; with text alone every generation frames it differently |
| last frame | no | — | this unit uses references to keep the product and people; the model takes no last frame alongside them |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 20.2–30.8s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #11 (key): smug (medium) · eyes narrow, one brow drops, sly smirk, thumb to chin (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1.
Over-the-shoulder at the kitchen window: a Krusty Burger restaurant across the road. The camera slowly pushes in and re-frames onto Skinner's face as he plots: '...I were to purchase fast food and disguise it as my own cooking? Ho ho ho, delightfully devilish, Seymour.'. Acting (moderate, not exaggerated): eyes narrow, one brow drops, sly smirk, thumb to chin; turns from window toward camera
```

**G9 · shots #12–#14 · 3.6s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | the last frame of G8's result; this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | hard cut from the previous unit in the same scene; matching the first frame keeps it from jumping |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 30.8–34.4s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #12: hurried (medium) · determined (expression in the first frame, see “Acting and emotion”)
- Acting #13: alarm (medium) · eyes wide, hand to mouth (expression in the first frame, see “Acting and emotion”)
- Acting #14 (key): suspicious (light) · eyes wide then narrowing to slits, mouth flat (expression in the first frame, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–1.0s): Wide kitchen: Skinner whips off the apron, drops it by the stove and starts climbing through the open window.Acting (moderate, not exaggerated): determined; pulls off apron, swings a leg over the sill
Shot 2 (1.0–2.4s): Seen through the kitchen doorway past Skinner's raised leg: the door opens and Chalmers walks in, catching him half out of the window.Acting (moderate, not exaggerated): eyes wide, hand to mouth; frozen with one leg on the sill
Shot 3 (2.4–3.6s): Close-up of Chalmers staring; his eyes slowly narrow. Held beat with no dialogue.Acting (very subtle, barely visible): eyes wide then narrowing to slits, mouth flat; motionless
```

**G10 · shots #15 · 14.8s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | source frame `shots/shot_015_first.jpg` (to change product, person or style, redraw it with an image model from the first-frame prompt below); this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | locks composition, shot size and subject position; with text alone every generation frames it differently |
| last frame | no | — | this unit uses references to keep the product and people; the model takes no last frame alongside them |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 34.4–49.2s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #15 (key): angry (strong) · mouth wide open shouting in the final frame (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1.
Sitcom-opening parody. A painted title card reads 'Skinner & the Superintendent' with caricatures of both men; the camera pulls back to show it is a framed picture on woven brown wallpaper, then pans across more framed pictures, each a small animated vignette of the two characters (office, school corridor, a man knocked flat, snakes), while a jingle is sung. It ends by pushing into the last frame, which becomes Chalmers shouting 'Seymour!'. One continuous multiplane move, no hard cut. All lettering is painted artwork inside the picture, not an added overlay.Acting (openly expressed, features stay natural): mouth wide open shouting in the final frame; vignette poses
```

**G11 · shots #16–#18 · 8.6s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | source frame `shots/shot_016_first.jpg` (to change product, person or style, redraw it with an image model from the first-frame prompt below); this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | locks composition, shot size and subject position; with text alone every generation frames it differently |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 49.2–57.8s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #16: startled (strong) · eyes round, mouth small 'o' then gritted teeth (voice first, then drive, see “Acting and emotion”)
- Acting #17 (key): bluffing (medium) · forced grin (voice first, then drive, see “Acting and emotion”)
- Acting #18: suspicious (medium) · half-lidded, brow low (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–1.5s): Close-up of Skinner at the window, startled: 'Superintendent!'. Acting (openly expressed, features stay natural): eyes round, mouth small 'o' then gritted teeth; head whips round
Shot 2 (1.5–5.9s): Over Chalmers' shoulder (dark-suited back fills the left foreground): Skinner pumps his leg on the windowsill beside the smoking stove. Line: 'I was just, uh, stretching my calves on the windowsill. Isometric exercise! Care to join me?'. Acting (moderate, not exaggerated): forced grin; bobs up and down on the raised leg, gestures an invitation
Shot 3 (5.9–8.6s): Medium close-up of Chalmers at the kitchen door; he raises an arm and points: 'Why is there smoke coming out of your oven, Seymour?'. Acting (moderate, not exaggerated): half-lidded, brow low; points off-screen with a straight arm
```

**G12 · shots #19 · 7.3s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | the last frame of G11's result; this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | hard cut from the previous unit in the same scene; matching the first frame keeps it from jumping |
| last frame | no | — | this unit uses references to keep the product and people; the model takes no last frame alongside them |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 57.8–65.1s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #19 (key): bluffing (medium) · eyes shut then wide, toothy grin (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1.
Skinner beside the smoking stove, window behind: 'Uh... ooh! That isn't smoke, it's steam! Steam from the steamed clams we're having. Mmm, steamed clams!' He rubs his stomach. Slight camera drift.Acting (moderate, not exaggerated): eyes shut then wide, toothy grin; gestures at the stove, rubs belly
```

**G13 · shots #20–#22 · 5.3s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | the last frame of G12's result; this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | hard cut from the previous unit in the same scene; matching the first frame keeps it from jumping |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 65.1–70.3s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #20: skeptical (light) · narrow eyes, flat mouth (expression in the first frame, see “Acting and emotion”)
- Acting #22: relief (medium) · eyes closed, exhale (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–1.1s): Medium close-up of Chalmers staring, unconvinced, then turning away to leave.Acting (very subtle, barely visible): narrow eyes, flat mouth; slow turn of head and body
Shot 2 (1.1–1.8s): Chalmers' back as he walks out; the purple door swings shut and the frame holds on the closed door.
Shot 3 (1.8–5.3s): Skinner at the window wipes his brow, then dives head-first out of it; the frame holds on the empty window with the Krusty Burger across the road.Acting (moderate, not exaggerated): eyes closed, exhale; wipes forehead, bends and dives through window
```

**G14 · shots #23, #24 · 6.5s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | source frame `shots/shot_023_first.jpg` (to change product, person or style, redraw it with an image model from the first-frame prompt below); this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | locks composition, shot size and subject position; with text alone every generation frames it differently |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 70.3–76.9s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #23: proud (medium) · big grin, slightly out of breath (voice first, then drive, see “Acting and emotion”)
- Acting #24: puzzled (light) · one eye narrowed, brow raised (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–3.8s): Dining room, wide from behind Chalmers: Skinner comes in through the door carrying a silver platter stacked with burgers. Line: 'Superintendent, I hope you're ready for mouthwatering hamburgers!'. Acting (moderate, not exaggerated): big grin, slightly out of breath; carries platter in both hands to the table
Shot 2 (3.8–6.5s): Medium close-up of Chalmers tucking a napkin into his collar, ornate mirror behind: 'I thought we were having steamed clams.'. Acting (very subtle, barely visible): one eye narrowed, brow raised; tucks napkin at the neck
```

**G15 · shots #25, #26 · 6.8s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | the last frame of G14's result; this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | hard cut from the previous unit in the same scene; matching the first frame keeps it from jumping |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 76.9–83.7s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #25 (key): bluffing (medium) · wide smile, eyes flick to the guest (voice first, then drive, see “Acting and emotion”)
- Acting #26: skeptical (light) · half-lidded, brow up (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–4.3s): Skinner leans over the table and sets the platter down: 'Oh, no, I said steamed hams! That's what I call hamburgers.'. Acting (moderate, not exaggerated): wide smile, eyes flick to the guest; lowers platter, spreads a hand over it, sits
Shot 2 (4.3–6.8s): Chalmers, medium close-up with burgers along the bottom of frame: 'You call hamburgers steamed hams?'. Acting (very subtle, barely visible): half-lidded, brow up; still
```

**G16 · shots #27–#29 · 5.8s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | the last frame of G15's result; this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | hard cut from the previous unit in the same scene; matching the first frame keeps it from jumping |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 83.7–89.5s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #27: bluffing (light) · relaxed smile, eyelids low (voice first, then drive, see “Acting and emotion”)
- Acting #28: skeptical (light) · eyes narrow, mouth twists (voice first, then drive, see “Acting and emotion”)
- Acting #29: bluffing (light) · eyes shift, then smile (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–2.2s): Skinner seated, champagne flute in foreground: 'Yes. It's a regional dialect.'. Acting (very subtle, barely visible): relaxed smile, eyelids low; small open-hand gesture
Shot 2 (2.2–4.1s): Chalmers: 'Uh-huh. Eh, what region?'. Acting (very subtle, barely visible): eyes narrow, mouth twists; still
Shot 3 (4.1–5.8s): Skinner: 'Uh... upstate New York.'. Acting (very subtle, barely visible): eyes shift, then smile; still
```

**G17 · shots #30, #31 · 7.7s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | the last frame of G16's result; this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | hard cut from the previous unit in the same scene; matching the first frame keeps it from jumping |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 89.5–97.2s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #30 (key): skeptical (medium) · brow raised, teeth showing on the consonants (voice first, then drive, see “Acting and emotion”)
- Acting #31 (key): bluffing (medium) · eyelids low, quick smile (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–5.3s): Chalmers: 'Really. Well, I'm from Utica, and I've never heard anyone use the phrase steamed hams.' He raises an open hand.Acting (moderate, not exaggerated): brow raised, teeth showing on the consonants; lifts a hand palm-up at the end
Shot 2 (5.3–7.7s): Skinner: 'Oh, not in Utica, no. It's an Albany expression.' He waves a hand dismissively.Acting (moderate, not exaggerated): eyelids low, quick smile; flicks a hand
```

**G18 · shots #32–#34 · 6.5s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | the last frame of G17's result; this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | hard cut from the previous unit in the same scene; matching the first frame keeps it from jumping |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 97.2–103.7s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #32: resigned (light) · flat mouth (voice first, then drive, see “Acting and emotion”)
- Acting #34: suspicious (light) · eyes on the burger, then up (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–1.0s): Chalmers: 'I see.'. Acting (very subtle, barely visible): flat mouth; still
Shot 2 (1.0–2.3s): Wide profile two-shot across the table: Chalmers bites a burger, Skinner tips back his drink. Picture of a boat on the wall between them.
Shot 3 (2.3–6.5s): Chalmers holds the burger and examines it: 'You know, these hamburgers are quite similar to the ones they have at Krusty Burger.'. Acting (very subtle, barely visible): eyes on the burger, then up; turns the burger in his hand
```

**G19 · shots #35, #36 · 7.8s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | the last frame of G18's result; this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | hard cut from the previous unit in the same scene; matching the first frame keeps it from jumping |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 103.7–111.5s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #35: bluffing (medium) · eyes closed in a laugh, then wide (voice first, then drive, see “Acting and emotion”)
- Acting #36: skeptical (light) · narrow eyes (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–5.1s): Over Chalmers' shoulder to Skinner across the table: 'Oh ho ho, no! Patented Skinner Burgers. Old family recipe!'. Acting (moderate, not exaggerated): eyes closed in a laugh, then wide; holds the flute, shakes his head
Shot 2 (5.1–7.8s): Chalmers, burger in hand: 'For steamed hams?'. Acting (very subtle, barely visible): narrow eyes; still
```

**G20 · shots #37, #38 · 4.6s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | the last frame of G19's result; this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | hard cut from the previous unit in the same scene; matching the first frame keeps it from jumping |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 111.5–116.2s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #37: bluffing (light) · fixed grin (voice first, then drive, see “Acting and emotion”)
- Acting #38 (key): skeptical (medium) · brow low, mouth pulled to one side (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–0.7s): Skinner: 'Yes.' Very short shot.Acting (very subtle, barely visible): fixed grin; holds flute up
Shot 2 (0.7–4.6s): Chalmers lifts the bun to show the patty: 'Yes, and you call them steamed hams despite the fact they are obviously grilled.' Grill marks are visible on the patty.Acting (moderate, not exaggerated): brow low, mouth pulled to one side; opens the burger and tilts it to camera
```

**G21 · shots #39 · 7.3s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | the last frame of G20's result; this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | hard cut from the previous unit in the same scene; matching the first frame keeps it from jumping |
| last frame | no | — | this unit uses references to keep the product and people; the model takes no last frame alongside them |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 116.2–123.5s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #39 (key): flustered (medium) · eyes dart, mouth starts words and stops (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1.
Over Chalmers' shoulder: Skinner stammers ('Ye— hey— you know— one thing I should— excuse me for one second'), dabs his face with a napkin; thin smoke begins drifting in at the top of frame.Acting (moderate, not exaggerated): eyes dart, mouth starts words and stops; napkin to face, half-rises
```

**G22 · shots #40 · 7.7s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | source frame `shots/shot_040_first.jpg` (to change product, person or style, redraw it with an image model from the first-frame prompt below); this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | locks composition, shot size and subject position; with text alone every generation frames it differently |
| last frame | no | — | this unit uses references to keep the product and people; the model takes no last frame alongside them |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 123.5–131.2s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #40: bluffing (medium) · wide fake smile, then a yawn (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1.
Same side of the table: Skinner steps into the kitchen and comes straight back, stretching: 'Well, that was wonderful. A good time was had by all. I'm pooped.' A red glow shows at the edge of the kitchen door.Acting (moderate, not exaggerated): wide fake smile, then a yawn; pats hands together, stretches arms
```

**G23 · shots #41, #42 · 5.3s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | the last frame of G22's result; this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | hard cut from the previous unit in the same scene; matching the first frame keeps it from jumping |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 131.2–136.5s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #41: calm (light) · relaxed (voice first, then drive, see “Acting and emotion”)
- Acting #42 (key): alarmed (strong) · eyes wide (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–1.6s): Chalmers pulls off his napkin and stands: 'Yes, I should be—'. Acting (very subtle, barely visible): relaxed; removes napkin, rises out of the chair
Shot 2 (1.6–5.3s): Two-shot: Chalmers spins and points at the kitchen ('Good Lord, what is happening in there?!'); Skinner answers 'Aurora Borealis.'. Acting (openly expressed, features stay natural): eyes wide; whirls and points with a straight arm
```

**G24 · shots #43–#46 · 7.3s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | the last frame of G23's result; this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | hard cut from the previous unit in the same scene; matching the first frame keeps it from jumping |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 136.5–143.7s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #43 (key): outraged (strong) · eyes wide then brows slam down, bared teeth (voice first, then drive, see “Acting and emotion”)
- Acting #44 (key): outraged (strong) · angled brows, wide mouth (voice first, then drive, see “Acting and emotion”)
- Acting #45 (key): outraged (strong) · eyes round, teeth showing (voice first, then drive, see “Acting and emotion”)
- Acting #46 (key): outraged (strong) · brows down hard (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–3.0s): Close-up of Chalmers: 'Aurora Borealis?!' First of five consecutive shots on the same angle that punch in a little tighter on each phrase.Acting (openly expressed, features stay natural): eyes wide then brows slam down, bared teeth; head jerks forward
Shot 2 (3.0–4.3s): Tighter on Chalmers: 'At this time of year,'. Acting (openly expressed, features stay natural): angled brows, wide mouth; head forward
Shot 3 (4.3–5.7s): Chalmers: 'at this time of day,'. Acting (openly expressed, features stay natural): eyes round, teeth showing; head forward
Shot 4 (5.7–7.3s): Chalmers: 'in this part of the country,'. Acting (openly expressed, features stay natural): brows down hard; head forward
```

**G25 · shots #47–#50 · 7.4s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | the last frame of G24's result; this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | hard cut from the previous unit in the same scene; matching the first frame keeps it from jumping |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 143.7–151.1s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #47 (key): outraged (strong) · brows down, mouth wide (voice first, then drive, see “Acting and emotion”)
- Acting #48 (key): calm (light) · eyelids low, then a toothy grin (voice first, then drive, see “Acting and emotion”)
- Acting #49 (key): curious (light) · eyes round, brow relaxed, small mouth (voice first, then drive, see “Acting and emotion”)
- Acting #50 (key): calm (light) · eyes slide to the side, mouth small (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–2.8s): Tightest framing on Chalmers: 'localized entirely within your kitchen?!'. Acting (openly expressed, features stay natural): brows down, mouth wide; head thrust forward
Shot 2 (2.8–3.7s): Close-up of Skinner with a red glow along the left edge of frame: 'Yes.'. Acting (very subtle, barely visible): eyelids low, then a toothy grin; still
Shot 3 (3.7–5.7s): Chalmers, anger gone: 'May I see it?'. Acting (very subtle, barely visible): eyes round, brow relaxed, small mouth; still
Shot 4 (5.7–7.4s): Skinner glances sideways toward the glow: 'No.'. Acting (very subtle, barely visible): eyes slide to the side, mouth small; still
```

**G26 · shots #51 · 5.5s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | source frame `shots/shot_051_first.jpg` (to change product, person or style, redraw it with an image model from the first-frame prompt below); this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | locks composition, shot size and subject position; with text alone every generation frames it differently |
| last frame | no | — | this unit uses references to keep the product and people; the model takes no last frame alongside them |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 151.1–156.7s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #51: bluffing (medium) · turns head, eyes wide (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1.
Exterior porch, medium wide: the purple front door opens and both men step out. Off-screen a woman shouts 'Seymour! The house is on fire!'; Skinner calls back 'No, Mother, it's just the Northern Lights.'. Acting (moderate, not exaggerated): turns head, eyes wide; cups a hand to his mouth to call back
```

**G27 · shots #52 · 5.0s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | the last frame of G26's result; this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | hard cut from the previous unit in the same scene; matching the first frame keeps it from jumping |
| last frame | no | — | this unit uses references to keep the product and people; the model takes no last frame alongside them |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 156.7–161.7s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #52 (key): content (light) · half-lidded, slight smile (voice first, then drive, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1.
Outdoor two-shot, houses and sky behind: Chalmers, 'Well, Seymour, you are an odd fellow, but I must say... you steam a good ham.'. Acting (very subtle, barely visible): half-lidded, slight smile; hands behind back, leans in
```

**G28 · shots #53–#56 · 7.1s · multi-reference generation**

| Input | Needed | From | Why |
|---|---|---|---|
| text prompt | yes | see the prompt below | describes picture, action and camera; every other input only constrains it |
| first frame | worth it | the last frame of G27's result; this model takes frame inputs or references, not both: pass it as one more reference image and write “@图片2 as the first frame” in the prompt (Jimeng's omni-reference accepts this; most APIs do not, drop it if refused) | hard cut from the previous unit in the same scene; matching the first frame keeps it from jumping |
| last frame | no | — | several shots in one call; a last frame would only constrain the final shot |
| reference image | yes | `@图片1` character reference images (one frontal face + one half-body per character) so the look stays consistent across shots | the first frame only fixes frame one; reference images keep the product and people consistent after it |
| reference video | worth it | `@视频1` source clip 161.7–168.8s | follow the action, camera move and cutting rhythm; reference only, the picture is not copied |

- Alternative: a 2D animation project. Split the character into layers and rig it in Live2D / Spine, or animate in After Effects; simple flat-style animation can also be Lottie / Canvas code written by an LLM. More controllable than a video model when lip sync and motion must be frame-accurate (R19)
- Acting #53: content (light) · neutral (expression in the first frame, see “Acting and emotion”)
- Acting #54: suspicious (light) · one eye visible, narrowed (expression in the first frame, see “Acting and emotion”)
- Acting #55 (key): bluffing (medium) · flat look flips to a broad toothy grin, eyes wide (expression in the first frame, see “Acting and emotion”)

```text
Horizontal 16:9. Characters follow @图片1. Follow the action, camera movement and cutting rhythm of @视频1. Hard cuts between shots.
Shot 1 (0.0–3.6s): Porch: Chalmers turns and walks down the steps and along the path while the camera pulls back and reveals flames filling the ground-floor windows; Skinner stays by the door. Off-screen: 'Help! Help!'. One continuous pull-back.Acting (very subtle, barely visible): neutral; walks away, hands behind back
Shot 2 (3.6–4.2s): Chalmers from behind, turning his head back toward the house.Acting (very subtle, barely visible): one eye visible, narrowed; turns head over shoulder
Shot 3 (4.2–5.1s): Close-up of Skinner in front of the orange-lit doorway: a flat look, then a wide grin and a thumbs-up.Acting (moderate, not exaggerated): flat look flips to a broad toothy grin, eyes wide; raises a thumbs-up
Shot 4 (5.1–7.1s): Wide from the street: Chalmers walks out of the left foreground; the house windows glow with fire and Skinner stands at the door. The frame holds on the burning house.
```

### Acting and emotion

In a prompt, describe the visible expression and movement rather than words like “happy” or “sad”, and keep it smaller rather than bigger (strong emotion words tend to give mask faces and forced smiles); get the expression right in the first frame; for shots with lines, make the voice with its delivery first and let the picture act to it. For generated shots the Face and Movement below are already in the generation-unit prompts.

**all 50 shots**

| Shot | Who | Emotion (strength) | Face | Movement / change | Delivery | How to get it |
|---|---|---|---|---|---|---|
| #2 | A Skinner | nervous (light) | eyes wide, mouth closed | walks to the door, hand on the knob | — | expression in the first frame |
| #3 | B Chalmers | annoyed (light) | half-lidded eyes, brow low, speaks through clenched teeth | head still, body square to the door | dry, clipped, slightly raised pitch | voice first, then drive |
| #4 | A Skinner | eager (medium) | wide eyes, big open smile, eyebrows up | leans toward the guest, then steps aside | bright, over-polite | voice first, then drive |
| #5 | B Chalmers | calm (light) | neutral | sets bottle in bucket, pulls out chair and sits | — | expression in the first frame |
| #8 | A Skinner | shock (strong) ★key | eyes shut then pop wide, mouth drops open | freezes, then bolts out of frame | gasp | voice first, then drive |
| #9 | A Skinner | dismay (strong) ★key | wide eyes fixed on the roast, mouth open | leaning in to the oven | loud, theatrical | voice first, then drive |
| #10 | A Skinner | anxious (medium) | brow knotted, eyes darting | hand on head, then fingers to mouth, turns to window | muttering | voice first, then drive |
| #11 | A Skinner | smug (medium) ★key | eyes narrow, one brow drops, sly smirk, thumb to chin | turns from window toward camera | low, conspiratorial chuckle | voice first, then drive |
| #12 | A Skinner | hurried (medium) | determined | pulls off apron, swings a leg over the sill | — | expression in the first frame |
| #13 | A Skinner | alarm (medium) | eyes wide, hand to mouth | frozen with one leg on the sill | — | expression in the first frame |
| #14 | B Chalmers | suspicious (light) ★key | eyes wide then narrowing to slits, mouth flat | motionless | — | expression in the first frame |
| #15 | B Chalmers | angry (strong) ★key | mouth wide open shouting in the final frame | vignette poses | sung jingle, then a shout | voice first, then drive |
| #16 | A Skinner | startled (strong) | eyes round, mouth small 'o' then gritted teeth | head whips round | yelp | voice first, then drive |
| #17 | A Skinner | bluffing (medium) ★key | forced grin | bobs up and down on the raised leg, gestures an invitation | breezy, slightly too fast | voice first, then drive |
| #18 | B Chalmers | suspicious (medium) | half-lidded, brow low | points off-screen with a straight arm | flat, accusing | voice first, then drive |
| #19 | A Skinner | bluffing (medium) ★key | eyes shut then wide, toothy grin | gestures at the stove, rubs belly | hesitant start, then sing-song | voice first, then drive |
| #20 | B Chalmers | skeptical (light) | narrow eyes, flat mouth | slow turn of head and body | — | expression in the first frame |
| #22 | A Skinner | relief (medium) | eyes closed, exhale | wipes forehead, bends and dives through window | 'Phew' | voice first, then drive |
| #23 | A Skinner | proud (medium) | big grin, slightly out of breath | carries platter in both hands to the table | bright, panting | voice first, then drive |
| #24 | B Chalmers | puzzled (light) | one eye narrowed, brow raised | tucks napkin at the neck | level, questioning | voice first, then drive |
| #25 | A Skinner | bluffing (medium) ★key | wide smile, eyes flick to the guest | lowers platter, spreads a hand over it, sits | cheerful, improvised | voice first, then drive |
| #26 | B Chalmers | skeptical (light) | half-lidded, brow up | still | slow, incredulous | voice first, then drive |
| #27 | A Skinner | bluffing (light) | relaxed smile, eyelids low | small open-hand gesture | casual | voice first, then drive |
| #28 | B Chalmers | skeptical (light) | eyes narrow, mouth twists | still | dry | voice first, then drive |
| #29 | A Skinner | bluffing (light) | eyes shift, then smile | still | hesitant | voice first, then drive |
| #30 | B Chalmers | skeptical (medium) ★key | brow raised, teeth showing on the consonants | lifts a hand palm-up at the end | measured, pointed | voice first, then drive |
| #31 | A Skinner | bluffing (medium) ★key | eyelids low, quick smile | flicks a hand | quick, confident | voice first, then drive |
| #32 | B Chalmers | resigned (light) | flat mouth | still | flat | voice first, then drive |
| #34 | B Chalmers | suspicious (light) | eyes on the burger, then up | turns the burger in his hand | thoughtful | voice first, then drive |
| #35 | A Skinner | bluffing (medium) | eyes closed in a laugh, then wide | holds the flute, shakes his head | hearty fake laugh | voice first, then drive |
| #36 | B Chalmers | skeptical (light) | narrow eyes | still | flat | voice first, then drive |
| #37 | A Skinner | bluffing (light) | fixed grin | holds flute up | bright | voice first, then drive |
| #38 | B Chalmers | skeptical (medium) ★key | brow low, mouth pulled to one side | opens the burger and tilts it to camera | slow, emphatic on 'obviously grilled' | voice first, then drive |
| #39 | A Skinner | flustered (medium) ★key | eyes dart, mouth starts words and stops | napkin to face, half-rises | broken, stuttering | voice first, then drive |
| #40 | A Skinner | bluffing (medium) | wide fake smile, then a yawn | pats hands together, stretches arms | fast, forced cheer | voice first, then drive |
| #41 | B Chalmers | calm (light) | relaxed | removes napkin, rises out of the chair | polite | voice first, then drive |
| #42 | B Chalmers | alarmed (strong) ★key | eyes wide | whirls and points with a straight arm | shouted | voice first, then drive |
| #43 | B Chalmers | outraged (strong) ★key | eyes wide then brows slam down, bared teeth | head jerks forward | loud, rising | voice first, then drive |
| #44 | B Chalmers | outraged (strong) ★key | angled brows, wide mouth | head forward | loud | voice first, then drive |
| #45 | B Chalmers | outraged (strong) ★key | eyes round, teeth showing | head forward | loud | voice first, then drive |
| #46 | B Chalmers | outraged (strong) ★key | brows down hard | head forward | loud | voice first, then drive |
| #47 | B Chalmers | outraged (strong) ★key | brows down, mouth wide | head thrust forward | shouted | voice first, then drive |
| #48 | A Skinner | calm (light) ★key | eyelids low, then a toothy grin | still | bright, simple | voice first, then drive |
| #49 | B Chalmers | curious (light) ★key | eyes round, brow relaxed, small mouth | still | quiet | voice first, then drive |
| #50 | A Skinner | calm (light) ★key | eyes slide to the side, mouth small | still | flat | voice first, then drive |
| #51 | A Skinner | bluffing (medium) | turns head, eyes wide | cups a hand to his mouth to call back | raised voice | voice first, then drive |
| #52 | B Chalmers | content (light) ★key | half-lidded, slight smile | hands behind back, leans in | warm, measured | voice first, then drive |
| #53 | B Chalmers | content (light) | neutral | walks away, hands behind back | — | expression in the first frame |
| #54 | B Chalmers | suspicious (light) | one eye visible, narrowed | turns head over shoulder | — | expression in the first frame |
| #55 | A Skinner | bluffing (medium) ★key | flat look flips to a broad toothy grin, eyes wide | raises a thumbs-up | — | expression in the first frame |

- **expression in the first frame**: Get the expression right in the first frame; the prompt only describes the motion and the change
- **voice first, then drive**: Speaking: make the voice with its delivery first (TTS with tone tags only where the emotion turns, or a real recording), then drive mouth and face from that audio (Kling Avatar, OmniHuman); with a video model that makes sound itself, put the line and its delivery in the prompt together
