// Exterior shots: the street, the doorstep, the porch.
import * as P from "../pieces";
import * as THREE from "three";
import { defineShot, defineStage } from "../dsl";

/** P.block wrapped so that its origin (bottom centre of the front face) survives `put` / `fit`. */
const B = (w: number, h: number, d: number, color: number) => new THREE.Group().add(P.block(w, h, d, color));

// K03: doorstep, looking out of the doorway at the street. The reference picture is the close-up
// on the guest; the two-shot after the whip pull-back spans ref x -0.4..1.45, y -0.3..1.2.
defineStage("K03", (s) => {
  s.cam({ fov: 18, bg: P.C.sky });
  const street = s.put(P.backdrop("suburb", 16, 9), { at: [0.6, 1.25], depth: 14 });
  // door frame at both edges of the two-shot, door leaf standing open behind the host
  s.fit((w, h) => B(w, h, 0.12, P.C.wallBlue), [-0.62, -0.6, -0.33, 1.6], 3.2);
  s.fit((w, h) => B(w, h, 0.12, P.C.wallBlue), [1.3, -0.6, 1.75, 1.6], 3.2);
  const leaf = s.fit((w, h) => P.door(w, h, { frame: false, hinge: "right" }), [0.95, -0.5, 1.5, 1.5], 3.6);
  // the door leaf seen from outside, wiping off to the right as it opens (S03 73-78)
  const wipe = s.fit((w, h) => B(w, h, 0.04, P.C.door), [0.44, -0.4, 1.7, 1.4], 0.6);
  s.defaults.slide = 0;
  s.defaults.door = 0;
  s.on(({ vars }) => {
    street.position.x = s.point(0.6, 1.25, 14).x + vars.slide! * 2.2;
    // door: 0 = standing open at the right, 1 = swung across the close-up
    leaf.position.copy(s.point(1.22, 1.5, 3.6));
    wipe.visible = vars.door! > 0.01;
    wipe.position.copy(s.point(1.07 + (1 - vars.door!) * 1.1, 1.4, 0.6));
  });
});

defineShot("S03", {
  actors: {
    guest: {
      track: { k: 0.92 },
      keys: [
        { f: 73, pos: "track", legs: "stand", step: 0, face: 60, head: [62, -4, 0], eyes: [0.5, -0.4], lids: 0.5, brows: [-0.3, -0.4], mouth: -0.7, armL: "chest", handL: "grip", holdL: "bottle" },
        { f: 77, to: 79, head: [62, 2, 0], brows: [-0.6, -0.8], eyes: [0.6, 0], lids: 0.35 },
        { f: 93, to: 102, brows: [0.2, 0.5], lids: 0.15 },
        { f: 103, brows: [-0.6, -0.8], lids: 0.35 },
        { f: 125, to: 125, lids: 0.85 },
        { f: 126, to: 126, lids: 0.35 },
        { f: 132, to: 133, head: [62, 9, 0] },
        { f: 134, to: 141, head: [62, 2, 0], brows: [0.2, 0.5], lids: 0.15 },
        { f: 145, brows: [-0.6, -0.8], lids: 0.35 },
        { f: 162, head: [66, 0, 0], eyes: [0.6, 0.1], lids: 0.45 },
        { f: 232, to: 241, lids: 0.6 },
        { f: 261, to: 266, face: 40, head: [50, 0, 0], legs: "walk", step: 1, lids: 0.3, eyes: [0.7, 0], armL: { rel: [-0.16, -0.1, 0.22] } },
        { f: 264, to: 267, pos: [0.42, 0.35, 0.52] },
        { f: 268, to: 269, pos: [0.5, 0.36, 0.54], step: 2 },
        { f: 270, to: 271, pos: [0.54, 0.36, 0.55] },
        { f: 272, to: 273, pos: [0.6, 0.36, 0.55], step: 3 },
        { f: 274, to: 275, pos: [0.66, 0.36, 0.55] },
        { f: 276, to: 277, pos: [0.76, 0.36, 0.55], step: 4, face: 70, head: [75, 0, 0] },
        { f: 278, to: 279, pos: [0.86, 0.36, 0.55] },
        { f: 280, to: 281, pos: [0.97, 0.36, 0.55], step: 5 },
        { f: 282, to: 283, pos: [1.06, 0.36, 0.55] },
        { f: 284, to: 286, pos: [1.2, 0.36, 0.55], step: 6 },
      ],
      blinks: [84, 106, 107, 142, 189, 190],
    },
    host: {
      track: { k: 1.0 },
      keys: [
        { f: 73, show: false },
        { f: 159, show: true, face: -55, head: [-60, 0, 0], apron: true, eyes: [-0.5, 0], lids: 0.05, brows: [0.7, 0.2], mouth: 0.9, teeth: 1, open: 0.5, lean: 6 },
        { f: 163, to: 165, teeth: 0, open: 0.4 },
        { f: 172, to: 173, head: [-58, 12, 0] },
        { f: 174, to: 175, head: [-58, 0, 0], open: 0, mouth: 0.8 },
        { f: 176, to: 180, head: [-85, 8, 0] },
        { f: 181, to: 186, head: [-80, 2, 0], teeth: 1, lean: 10 },
        { f: 187, to: 189, head: [-80, -10, 0] },
        { f: 190, to: 195, head: [-80, -8, 0], lean: 14, teeth: 0, brows: [0.3, 0] },
        { f: 196, to: 198, head: [-75, 14, 0], lean: 4 },
        { f: 199, mouth: 0.6 },
        { f: 208, to: 211, head: [-10, 4, 12], eyes: [-0.3, 0], lids: 0, brows: [0.8, 0.2], mouth: 1, open: 0.5 },
        { f: 216, to: 218, head: [-35, 2, 18], open: 0.3, eyes: [-0.7, 0] },
        { f: 219, to: 220, open: 0 },
        { f: 221, to: 223, head: [-20, 4, 14], open: 0.3 },
        { f: 227, head: [-20, 0, 12] },
        { f: 231, head: [-20, 4, 14] },
        { f: 234, to: 235, lids: 0.6, open: 0, teeth: 1 },
        { f: 236, to: 238, lids: 1, head: [-55, 0, 8], teeth: 0, open: 0.3 },
        { f: 239, to: 240, head: [-5, 6, 6], open: 0.8 },
        { f: 241, to: 242, lids: 0.5, open: 0, teeth: 1 },
        { f: 243, to: 245, head: [-80, 0, 0], brows: [0.5, 0.7], lids: 0.05, teeth: 0, lean: 12, eyes: [-0.5, 0] },
        { f: 256, teeth: 1, mouth: 0.9, brows: [0.6, 0.2] },
        { f: 265, teeth: 0, mouth: 0.8, eyes: [-0.2, 0] },
        { f: 271, lids: 0, eyes: [0, 0] },
        { f: 276, to: 279, face: 30, head: [45, 0, 0], lids: 0.5, eyes: [0.6, 0], lean: 2 },
        { f: 283, lids: 0.15, eyes: [0.8, 0], mouth: 0.7 },
      ],
      blinks: [166, 204],
    },
  },
  vars: [
    { f: 73, door: 1, slide: 0 },
    { f: 74, to: 78, door: 0 },
    { f: 261, to: 276, slide: 1 },
  ],
});

// ---------------------------------------------------------------- K01: the house from the street (S01)

const DUSK = { sky: 0x5a4f96, lawn: 0x4f8a62 };

defineStage("K01", (s) => {
  s.cam({ fov: 18, bg: P.C.sky });
  s.pitch = -0.063; // looks down: horizon at ref y 0.3
  s.cam({});
  s.card(0x2f6e72, 60, [-1, 0.0, 2, 0.6]); // tree line
  s.floor(P.C.grass, 0.552, 58); // the ground plane under the house, out to 58 m
  const h = s.put(P.house(), { at: [0.47, 0.8], depth: 29, yaw: 14 });
  s.floorY = h.position.y + 0.35;
  s.put(P.tree(8), { at: [0.88, 0.98], depth: 22 });
  s.put(P.bush(0.9), { at: [0.76, 0.86], depth: 24 });
  // drive and path
  s.put(B(3.4, 0.03, 12, P.C.road), { at: [0.1, 1.02], depth: 22, yaw: 14 });
  s.put(B(1.3, 0.03, 9, 0xc9c9cf), { at: [0.4, 1.06], depth: 20, yaw: 14 });
  // doorbell
  const bell = P.block(0.08, 0.12, 0.03, P.C.brass, 0.75, 1.5, 0.06);
  h.add(bell);
});

defineShot("S01", {
  actors: {
    guest: {
      speak: false,
      keys: [
        { f: 0, pos: [0.487, 0.632, 0.027], face: 180, armL: "down", armR: "down", handR: "open" },
        { f: 10, to: 12, armR: { rel: [0.1, -0.28, 0.2] }, handR: "fist" },
        { f: 13, to: 15, armR: { at: [0.535, 0.665], z: 0.35 }, handR: "point" },
        { f: 38, to: 41, armR: "down", handR: "open" },
      ],
    },
  },
  vars: [{ f: 0, to: 0, fade: 1 }, { f: 1, to: 4, fade: 0 }],
});

// ---------------------------------------------------------------- K34: the porch, square on (S49)

const SHUTTER = 0x8a5a8a, HALL = 0x8fb9a8, EMBER = 0xc4502c;

defineStage("K34", (s) => {
  s.cam({ fov: 18, bg: P.C.houseLilac });
  const W = 3.6;
  // wall around the door opening
  s.card(P.C.houseLilac, W, [-1, -1, 0.39, 2]);
  s.card(P.C.houseLilac, W, [0.7, -1, 2, 2]);
  s.card(HALL, 4.6, [0.2, -0.5, 0.9, 1.6]);
  s.fit((w, h) => P.picture(w, h, { art: "fruit" }), [0.6, 0.28, 0.69, 0.5], 4.55);
  for (const x of [0.345, 0.715]) s.fit((w, h) => B(w, h, 0.05, P.C.trim), [x, -0.2, x + 0.04, 1.3], W - 0.02);
  const d = s.fit((w, h) => P.door(w, h, { frame: false, hinge: "left" }), [0.39, -0.12, 0.7, 1.1], W);
  d.add(P.orb(0.035, 0.02, 0.02, P.C.brass, 0, 1.2, 0.04));
  // windows at the frame edges
  s.fit((w, h) => B(w, h, 0.02, 0xe9e6c0), [-0.3, -0.05, 0.03, 0.74], W - 0.02);
  s.fit((w, h) => B(w, h, 0.04, SHUTTER), [0.07, -0.08, 0.21, 0.72], W - 0.02);
  s.fit((w, h) => B(w, h, 0.04, SHUTTER), [0.9, -0.12, 1.03, 0.76], W - 0.02);
  // balustrade in front
  s.fit((w, h) => P.balustrade(w, h), [0.45, 0.8, 1.1, 1.35], 2.35);
  s.fit((w, h) => P.balustrade(w, h), [-0.2, 0.78, 0.07, 1.35], 3.0);
  s.defaults.door = 0;
  s.on(({ vars }) => P.setDoor(d, -vars.door!)); // opens inward
});

defineShot("S49", {
  actors: {
    guest: {
      keys: [
        { f: 3623, show: false, face: -80, head: [-80, 0, 0], lids: 0.5, brows: [-0.2, -0.2], mouth: -0.3, pos: [0.74, 0.13, 0.24], legs: "walk", step: 0, lean: 0, armL: "down", armR: "down" },
        { f: 3626, show: true },
        { f: 3626, to: 3628, pos: [0.67, 0.13, 0.25], step: 1 },
        { f: 3629, to: 3630, pos: [0.6, 0.15, 0.27], face: -60, head: [-45, 0, 0], step: 2 },
        { f: 3631, to: 3636, pos: [0.56, 0.17, 0.28], step: 3 },
        { f: 3637, to: 3638, pos: [0.46, 0.16, 0.29], face: -30, head: [-25, 0, 0], lean: 12, step: 4 },
        { f: 3639, to: 3640, pos: [0.4, 0.17, 0.3], step: 5 },
        { f: 3641, to: 3642, pos: [0.32, 0.2, 0.3], face: 0, head: [0, 0, 0], mouth: 0.3, step: 6 },
        { f: 3643, to: 3643, pos: [0.3, 0.2, 0.3], lean: 4, legs: "stand", armL: { rel: [0.3, -0.35, 0.05] }, armR: { rel: [0.3, -0.35, 0.05] } },
        { f: 3644, to: 3647, pos: "track", face: 80, head: [82, 0, 0], lean: 0, armL: "back", armR: "back", mouth: -0.6, eyes: [0.5, 0], lids: 0.55 },
        { f: 3666, to: 3669, head: [82, 8, 0] },
        { f: 3670, lids: 0.05, eyes: [0.4, 0.8], brows: [-0.5, -0.3] },
        { f: 3708, lids: 0.55 },
        { f: 3712, head: [82, 0, 0], eyes: [0.5, 0], lids: 0.55 },
      ],
      blinks: [3666, 3709],
    },
    host: {
      keys: [
        { f: 3623, show: false, face: -10, head: [-15, 0, 0], mouth: 0.7, pos: [0.72, 0.2, 0.23], armL: "down", armR: "down", handL: "open", handR: "open", teeth: 0, open: 0, lean: 0, lids: 0.2, brows: [0.2, 0] },
        { f: 3632, show: true },
        { f: 3633, to: 3637, pos: [0.66, 0.2, 0.24], face: 0, head: [0, 0, 0] },
        { f: 3638, to: 3642, pos: "track" },
        { f: 3644, head: [-45, 0, 0], lids: 0.05, eyes: [-0.5, 0] },
        { f: 3654, to: 3655, mouth: 0, lids: 0.5 },
        { f: 3656, to: 3656, lids: 1, brows: [-0.2, 0.6] },
        { f: 3659, to: 3659, lids: 0.1, eyes: [0, 1], mouth: -0.7 },
        { f: 3704, to: 3705, face: 10, head: [5, 0, 0], mouth: 0.6, eyes: [0, 0.2], armL: { at: [0.7, 0.62], z: 0.25 } },
        { f: 3706, to: 3707, face: 30, head: [40, 5, 0], teeth: 1, armL: { at: [0.7, 0.45], z: 0.25 }, armR: { at: [0.46, 0.8], z: 0.3 }, handR: "grip" },
        { f: 3708, to: 3711, head: [50, 25, 0], teeth: 0, open: 0.4, eyes: [0.3, 0.8], armL: { at: [0.685, 0.3], z: 0.25 }, handL: "flat", lean: -6 },
        { f: 3729, to: 3739, lids: 0.5 },
        { f: 3741, lids: 0.1 },
      ],
      blinks: [3677, 3681],
    },
  },
  vars: [{ f: 3623, door: 0 }, { f: 3624, to: 3629, door: 78 }],
});

// ---------------------------------------------------------------- K35: the street, over the host's shoulder (S50, S52)

defineStage("K35", (s) => {
  s.cam({ fov: 18, bg: P.C.sky });
  s.put(P.backdrop("suburb", 15, 8.4), { at: [0.5, 1.3], depth: 14 });
});

defineShot("S50", {
  actors: {
    guest: {
      keys: [
        { f: 3756, face: 35, head: [40, 0, 0], eyes: [0.4, 0.7], lids: 0.5, brows: [-0.2, 0], mouth: -0.6, armL: "back", armR: "back", teeth: 0, lean: 0, open: 0 },
        { f: 3759, to: 3761, eyes: [0.5, 0], head: [50, 0, 0] },
        { f: 3792, eyes: [0.3, -0.6], lids: 0.55 },
        { f: 3819, to: 3819, lids: 1 },
        { f: 3825, to: 3825, lids: 0.5, eyes: [0.5, 0] },
        { f: 3842, to: 3845, lids: 0, brows: [0.8, 0.1], mouth: 0.9, head: [50, 4, 0] },
        { f: 3849, to: 3849, teeth: 1 },
        { f: 3852, to: 3852, teeth: 0 },
        { f: 3860, to: 3863, head: [55, -8, -6], lean: 8, open: 0.3 },
        { f: 3864, to: 3869, head: [50, 4, 0], lean: 2, open: 0 },
      ],
      blinks: [3789],
    },
    host: {
      speak: false,
      keys: [
        { f: 3756, pos: [0.73, 0.31, 0.5], face: -105, head: [-85, 25, 0], eyes: [0, 0.9], lids: 0.1, mouth: -0.2, armL: { at: [0.57, 0.42], z: 0.3 }, handL: "flat" },
        { f: 3757, to: 3758, armL: { at: [0.55, 0.52], z: 0.35 }, handL: "open" },
        { f: 3759, to: 3761, armL: "down" },
        { f: 3772, to: 3775, head: [-110, 0, 0], eyes: [-0.4, 0] },
        { f: 3776, to: 3780, face: -150, head: [-152, 0, 0], pos: [0.72, 0.34, 0.52] },
      ],
    },
  },
});

defineShot("S52", {
  actors: {
    guest: {
      speak: false,
      keys: [
        { f: 3962, face: -150, head: [-140, 0, 0], lids: 0.5, brows: [-0.1, 0], mouth: -0.3 },
        { f: 3963, to: 3966, head: [-90, 0, 0] },
        { f: 3966, to: 3969, face: 40 },
        { f: 3967, to: 3969, head: [45, 0, 0], eyes: [0.6, 0] },
      ],
    },
  },
});

// ---------------------------------------------------------------- K36: the porch, pulling back to the house front (S51)

// The wide end frame, in the reference picture of the shot's first frame.
const wx = (x: number) => 2.085 * x - 0.774, wy = (y: number) => 2.085 * y - 0.4535;
const wr = (x0: number, y0: number, x1: number, y1: number): [number, number, number, number] => [wx(x0), wy(y0), wx(x1), wy(y1)];

defineStage("K36", (s) => {
  s.cam({ fov: 18, bg: P.C.houseLilac });
  const W = 6.6;
  s.card(P.C.houseLilac, W, wr(-1, -1, 0.53, 2));
  s.card(P.C.houseLilac, W, wr(0.605, -1, 2, 2));
  s.card(P.C.houseLilac, W, wr(0.5, -1, 0.65, 0.2));
  s.card(P.C.roof, W - 0.1, wr(-1, -1, 2, 0.03));
  s.put(P.glow(4, 4, EMBER, 1), { at: [wx(0.565), wy(0.9)], depth: W + 0.6 });
  s.fit((w, h) => B(w, h, 0.03, P.C.trim), wr(0.425, 0.17, 0.635, 0.2), W - 0.03);
  for (const x of [0.425, 0.605]) s.fit((w, h) => B(w, h, 0.03, P.C.trim), wr(x, 0.2, x + 0.03, 0.68), W - 0.03);
  // the door stands open at the left of the doorway
  s.fit((w, h) => P.door(w, h, { frame: false, hinge: "right" }), wr(0.455, 0.2, 0.53, 0.67), W - 0.15);
  const wins = [wr(0.15, 0.13, 0.325, 0.5), wr(0.755, 0.13, 0.915, 0.5)].map((r) => s.fit((w, h) => P.shutterWindow(w, h), r, W - 0.04));
  for (const r of [wr(0.14, 0.5, 0.335, 0.52), wr(0.745, 0.5, 0.925, 0.52)]) s.fit((w, h) => P.glow(w, h, 0xff5a9a, 0.8), r, W - 0.1);
  for (const r of [wr(0.15, 0.13, 0.325, 0.24), wr(0.755, 0.13, 0.915, 0.24)]) s.fit((w, h) => P.glow(w, h, 0x77707c, 0.85), r, W - 0.12);
  // porch, railing, steps, lawn
  s.fit((w, h) => B(w, h, 0.5, 0xd8d6e6), wr(-0.5, 0.68, 1.5, 0.735), W - 0.2);
  s.fit((w, h) => P.balustrade(w, h), wr(0.04, 0.5, 0.315, 0.68), 5.95);
  s.fit((w, h) => P.balustrade(w, h), wr(0.625, 0.5, 1.2, 0.68), 5.95);
  s.fit((w, h) => B(w, h, 0.3, 0xc8c6d6), wr(0.33, 0.7, 0.62, 0.74), 5.9);
  s.fit((w, h) => B(w, h, 0.3, 0xbcbacc), wr(0.34, 0.735, 0.625, 0.775), 5.6);
  s.floor(P.C.grass, wy(0.745), W);
  const path = B(1.5, 0.02, 7, 0xb9b7c6);
  s.put(path, { at: [wx(0.475), wy(0.775)], depth: 5.6, yaw: 22 });
  path.position.y = s.floorY + 0.005;
  for (const [x, y, r] of [[0.12, 0.76, 0.33], [0.27, 0.75, 0.3], [0.7, 0.75, 0.36], [0.84, 0.76, 0.33]] as const) s.put(P.bush(r), { at: [wx(x), wy(y)], depth: 5.75 });
  s.on(({ f }) => { for (const w of wins) P.setFire(w, f, 1); });
});

defineShot("S51", {
  actors: {
    guest: {
      speak: false,
      track: { k: 0.6, oy: -0.4, size: "track" },
      keys: [
        { f: 3876, legs: "stand", step: 0, lean: 0, face: 80, head: [82, 0, 0], armL: "back", armR: "back", lids: 0.5, mouth: -0.2, eyes: [0.4, 0] },
        { f: 3878, to: 3880, lean: 8, armR: "down", legs: "walk", step: 0.5 },
        { f: 3881, to: 3882, face: -25, head: [-40, 0, 0], armL: { rel: [0.3, -0.38, 0.05] }, armR: { rel: [0.3, -0.38, 0.05] }, step: 1, mouth: 0.2, eyes: [-0.3, 0] },
        { f: 3883, to: 3886, armL: "down", armR: "down", step: 2, lean: 4 },
        { f: 3887, to: 3899, step: 4, face: -10, head: [-35, 0, 0] },
        { f: 3900, to: 3961, step: 14.3, face: 0 },
      ],
    },
    host: {
      speak: false,
      keys: [
        { f: 3876, rpos: [0.485, 0.14, 0.123], face: 0, head: [-40, 0, 0], armL: "back", armR: "back", lids: 0.05, mouth: 0.8, eyes: [-0.4, -0.1], brows: [0.5, 0] },
        { f: 3900, to: 3930, head: [-35, -4, 0], eyes: [-0.3, -0.3] },
      ],
      blinks: [3883],
    },
  },
});

// ---------------------------------------------------------------- K37: the host in the doorway (S53)

defineStage("K37", (s) => {
  s.cam({ fov: 18, bg: EMBER });
  s.card(EMBER, 3);
  s.fit((w, h) => P.glow(w, h, 0x8a7a9c, 0.75), [0.15, -0.05, 0.85, 0.22], 2.9);
  s.fit((w, h) => B(w, h, 0.4, 0x5a5230), [0.42, 0.42, 0.52, 1.1], 2.8); // hall furniture
  const leaf = s.fit((w, h) => B(w, h, 0.05, P.C.door), [-0.3, -0.2, 0.19, 1.2], 1.7);
  leaf.add(P.block(0.14, 0.25, 0.01, P.C.doorPanel, 0.06, 0.62, 0.01), P.block(0.14, 0.3, 0.01, P.C.doorPanel, 0.06, 0.22, 0.01), P.orb(0.03, 0.02, 0.02, P.C.brass, 0.05, 0.5, 0.03));
  s.fit((w, h) => B(w, h, 0.1, P.C.doorFrame), [0.8, -0.2, 1.3, 1.2], 1.7);
});

defineShot("S53", {
  actors: {
    host: {
      speak: false,
      keys: [
        { f: 3976, face: -30, head: [-40, 0, 0], eyes: [-0.6, 0], lids: 0, brows: [0.4, 0.8], mouth: -0.6, armR: "down", handR: "fist", teeth: 0 },
        { f: 3978, to: 3979, head: [-35, -12, -10], lids: 1, mouth: -0.1 },
        { f: 3980, to: 3983, armR: { at: [0.22, 0.68], z: 0.25 }, handR: "thumb" },
        { f: 3981, to: 3982, teeth: 1, mouth: 0.9 },
        { f: 3983, to: 3983, head: [-40, 2, 0], lids: 0, brows: [1, 0.1], eyes: [-0.5, 0] },
      ],
    },
  },
});

// ---------------------------------------------------------------- K38: from the street at dusk (S54)

defineStage("K38", (s) => {
  s.cam({ fov: 18, bg: DUSK.sky });
  s.put(P.backdrop("dusk", 60, 34), { at: [0.5, 1.2], depth: 45 });
  s.floor(DUSK.lawn, 0.775, 15.6);
  const h = s.put(P.house(), { at: [0.8, 0.775], depth: 15.6 });
  const door = h.userData.door as Parameters<typeof P.setDoor>[0];
  P.setDoor(door, 75); // stands open toward the street
  h.add(P.block(0.95, 2.05, 0.01, EMBER, 0, 0.35, 0.036));
  const pic = P.picture(0.3, 0.36, { art: "fruit" });
  pic.position.set(0.22, 1.35, 0.04);
  h.add(pic);
  const wins = h.userData.windows as Parameters<typeof P.setFire>[0][];
  for (const [x, y] of [[-2.1, 1.0], [2.5, 1.0]] as const) { const g = P.glow(2.1, 0.5, 0xff4f9a, 0.55); g.position.set(x, y + 0.05, 0.1); h.add(g); }
  const path = B(1.5, 0.02, 14, 0x8f8aa8);
  s.put(path, { at: [0.76, 0.8], depth: 13.2, yaw: 12 });
  path.position.y = s.floorY + 0.01;
  for (const [x, r] of [[0.47, 0.5], [0.6, 0.55], [0.93, 0.6]] as const) s.put(P.bush(r), { at: [x, 0.79], depth: 13.4 });
  const smoke = s.put(P.smoke(1.2, 4, 14), { at: [0.07, 0.3], depth: 17 });
  s.on(({ f }) => {
    P.setFire(wins[0]!, f, 0.8); P.setFire(wins[1]!, f, 0.8); P.setFire(wins[2]!, f, 0); P.setFire(wins[3]!, f, 0);
    P.animate(smoke, f, 1);
  });
});

defineShot("S54", {
  actors: {
    guest: {
      speak: false,
      keys: [
        { f: 3998, show: true, legs: "stand", step: 0, pos: [0.3, 0.33, 0.47], face: 150, head: [140, 0, 0], lids: 0.5, mouth: -0.2, brows: [-0.1, 0] },
        { f: 4005, to: 4006, head: [90, 0, 0], face: 120 },
        { f: 4007, to: 4008, face: 40, head: [40, 0, 0], eyes: [0.6, 0], pos: [0.24, 0.32, 0.5] },
        { f: 4009, to: 4010, face: 0, head: [5, 0, 0], mouth: 0.4, pos: [0.13, 0.32, 0.56], legs: "walk", step: 1 },
        { f: 4011, to: 4013, face: -35, head: [-40, 0, 0], eyes: [0, 0], pos: [0.07, 0.33, 0.6], step: 2 },
        { f: 4014, to: 4016, face: -70, head: [-70, 0, 0], pos: [0.03, 0.38, 0.64], step: 3 },
        { f: 4017, to: 4019, face: -135, head: [-135, 0, 0], pos: [-0.01, 0.42, 0.68], step: 4 },
        { f: 4019, to: 4024, pos: [-0.3, 0.6, 0.75], step: 6 },
        { f: 4025, show: false },
      ],
    },
    host: {
      speak: false,
      keys: [
        { f: 3998, show: true, legs: "stand", step: 0, lean: 0, pos: [0.853, 0.352, 0.052], face: -20, head: [-40, 0, 0], mouth: 0.9, teeth: 1, lids: 0.05, armR: { at: [0.828, 0.385], z: 0.2 }, handR: "thumb", armL: "down" },
        { f: 4013, to: 4014, armR: { rel: [0.35, -0.3, 0.1] }, handR: "open", teeth: 0, mouth: 0.6 },
        { f: 4015, to: 4016, armR: "hip" },
        { f: 4017, to: 4018, armR: "down" },
        { f: 4036, to: 4037, face: 150, head: [160, 0, 0], lean: 30, legs: "walk", step: 1, armL: { rel: [0.1, -0.25, 0.3] }, armR: { rel: [0.1, -0.3, -0.2] }, pos: [0.86, 0.38, 0.05] },
        { f: 4038, to: 4039, step: 2, armR: { rel: [0.1, -0.25, 0.3] }, armL: { rel: [0.1, -0.3, -0.2] }, pos: [0.875, 0.385, 0.048] },
        { f: 4040, to: 4041, step: 3, pos: [0.9, 0.39, 0.046] },
        { f: 4042, show: false },
      ],
    },
  },
  vars: [{ f: 3998, light: 0.62 }],
});
