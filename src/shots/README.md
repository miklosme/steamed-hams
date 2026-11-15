# Authoring shots

Each file here registers **stages** (the set behind one camera setup) and **shots** (who does what on which frame). A shot nobody has written still plays: tracked heads on a plain backdrop.

The method is screen-anchored 3D. Nothing is laid out on a floor plan. You say where things sit *in the picture* and how far from the camera they are, and the engine puts real 3D objects there. The reference is a 2D cartoon whose backgrounds do not agree between setups, so each setup gets its own small diorama.

## Loop

```sh
bun tools/shoot.ts /scratch/S25.jpg S25 8          # 8 [reference | render] pairs across the shot
bun tools/shoot.ts /scratch/a.jpg 1945 1960 3      # a frame range, every 3rd
bun tools/shoot.ts /scratch/a.jpg 1945,1977 --tile 800 --cols 1
bunx tsc --noEmit
```

`shoot` also prints how far each head is from the camera on each frame. Read it before placing furniture: a table at 3.5 m is behind a character whose head is at 2.5 m. Write sheets to a scratch directory, never into the repo. Read `timeline/shots/Sxx.json` for the shot's framing, cast, props and beats; `timeline/README.md` explains the data.

## Coordinates

- **Screen**: x 0..1 left to right, y 0..1 top to bottom, on the frame in question.
- **Ref** (reference picture): the same, on the first frame of the *first shot of the setup*. Stages are built in ref. For a static shot ref equals screen. Under a camera move ref stays fixed to the background; it can run outside 0..1.
- **Depth**: metres from the camera along its axis. A head `h` of frame height tall is at `0.24 / (h * 2 * tan(fov/2))`; with the default 18° lens a head half the frame high is 1.5 m away.
- Shots sharing a setup share the stage; the measured `setup_rel` / punch-in places each shot inside it automatically (`view` in the shot overrides it).

## Stage

```ts
defineStage("K22", (s) => {
  s.cam({ fov: 18, horizon: 0.42, bg: P.C.wallBlue }); // horizon < 0.5: camera looks down
  s.card(P.C.wallBlue, 7);                               // flat wall card at 7 m (optional rect)
  s.floor(P.C.carpet, 0.99, 6.9);                        // floor meeting the wall at ref y 0.99, 6.9 m away
  s.fit((w, h) => P.door(w, h), [0.52, -0.25, 0.86, 1.2], 6.8);   // build a piece to fill a ref rect at a depth
  s.put(P.table(), { at: [0.72, 1.1], depth: 2.4 });             // real-size piece, origin at ref point
  s.put(P.bottle(), { at: [0.42, 0.72], depth: 2.3, h: 0.2 });   // h: scale to a fraction of frame height
  const d = s.fit((w, h) => P.door(w, h), [0, 0, 0.3, 1], 4);
  s.defaults.door = 0;
  s.on(({ f, vars }) => P.setDoor(d, vars.door!));       // animate from shot `vars` and the frame number
});
```

`put` options: `at`, `depth`, `h` or `scale`, `yaw` (degrees about vertical), `rot`. Pieces are in `src/pieces.ts` (doors, windows with painted views, pictures, table, chairs, oven, cabinets, house, smoke, flames, glow, bottle, flute, platter, burger...); origins are bottom centre unless noted. `put` and `fit` overwrite the object's own position, and `P.block` / `P.cyl` / `P.orb` keep their origin offset there, so wrap a bare primitive in a `THREE.Group` before placing it. Build anything missing from `P.block`, `P.cyl`, `P.orb`, `P.card` in your own file. Effects animate with `P.animate(obj, f, amount)` inside `s.on`. Engine variables: `fade` (0..1 to black) and `light` (1 = normal).

## Shot

```ts
defineShot("S24", {
  actors: {
    host: {
      track: { k: 1.1, oy: -0.07 },       // optional: tune how the head track becomes the anchor
      keys: [
        { f: 1843, face: -35, head: [-50, -5, 0], lean: 25, eyes: [-0.5, -0.2], brows: [0.5, 0], mouth: 0.6,
          armR: { at: [0.5, 0.86] }, armL: { at: [0.92, 0.84] }, handL: "grip" },
        { f: 1905, to: 1912, lean: 10, legs: "sit" },
      ],
      blinks: [1870],
    },
  },
  vars: [{ f: 1843, door: 0 }, { f: 1850, to: 1858, door: 70 }],
  props: [{ make: () => P.platter(), keys: [{ f: 1843, at: [0.7, 0.86], depth: 2.2, h: 0.08 }] }],
});
```

- A key sets only the fields it names; each field holds its last value, and its *first* value also applies before that key, back to the start of the shot. Give every field you key later an explicit rest value on the first key (`show: true`, `legs: "stand"`, `armL: "down"`). The change first shows on `f` and is complete on `to` (default `f + 2`; `to: f` pops). This mirrors `f` / `f_end` in the beats.
- **Anchor**: by default the head follows the measured head track (`timeline/tracks.json`), smoothed, with one size for the whole shot. `track.k` scales the head, `track.oy` / `ox` shift it in head heights, `track.size: "track"` lets size follow the track (a character moving in depth). Tracks are skin blobs: they fail when a character is seen from behind, is tiny, overlaps another, or is cut by the frame edge. Then key `pos: [x, y, h]` by eye: head centre on screen and head height (chin to crown, hair excluded) as a fraction of frame height. `rpos` is the same in ref. `pos: "track"` returns to the track. A character with no head track and no `pos` is not drawn.
- **Headings** are relative to the camera: `face` 0 = toward camera, 90 = screen right, -90 = screen left, 180 = away. `head: [heading, pitch up, roll]` is absolute too, and clamps to 85° from the body; `head: null` follows the body. The drawn 3/4 profile is about ±50 to ±65.
- **Arms** are the character's own left and right (facing the camera, his right arm is on screen left). `armL` / `armR` take a preset (`down`, `hip`, `back`, `table`, `lap`, `chest`, `belly`, `chin`, `head`, `up`, `out`, `side`), `{ at: [x, y], z }` for a wrist position on screen (`z` metres toward the camera from the chest, default 0.2), `{ ref: [x, y] }`, `{ rel: [out, up, forward] }` metres from the shoulder, or `{ track: n }` to follow the shot's n-th `hand_or_other` track. `handL` / `handR`: `open`, `fist`, `point`, `thumb`, `grip`, `flat`. `holdL` / `holdR`: a prop from `held` in `pieces.ts` (`bottle`, `flute`, `burger`, `platter`, `roast`, `cloth`, `napkin`) or `null`.
- **Face**: `eyes: [right, up]` -1..1, `lids` 0 open .. 1 shut, `brows: [height, slant]` (slant -1 angry, 1 worried), `mouth` -1 frown .. 1 smile, `teeth: 1` for a grin or grimace, `open` for a held open mouth. `blinks` lists start frames. Lip movement comes from the aligned dialogue automatically (`speak: false` turns it off).
- **Body**: `lean` (forward bend, degrees), `sway`, `legs` (`stand`, `sit`, `walk` with `step` rising by 1 per stride), `footL` / `footR: { at: [x, y] }` for a planted or raised foot, `apron`, `bib`, `show`, `body` (body size relative to the head; default 0.85, 1 is a realistic adult; lower it when a full figure has to fit a small frame height).
- **Props** move by keys in screen (`at`) or ref (`rat`) with `depth`, `h` or `scale`, `yaw`, `rot`, `show`.

## What to aim for

The render is a control signal for a video model. In order: cuts and camera on the right frames (already automatic), each character in the right place at the right size, body heading and head attitude, the big gestures and prop moves from the beats on their frames, eye and brow changes, then set dressing. Characters are original designs: match staging, not likeness.
