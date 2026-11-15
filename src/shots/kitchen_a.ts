// Kitchen, first half: the smoking oven, the roast on fire, the scheme at the window, the escape.
import * as THREE from "three";
import * as P from "../pieces";
import { defineShot, defineStage } from "../dsl";

const WALL = 0x9cc4b4; // pale green kitchen wall
const WALL_DIM = 0x87a8a0;
const CUP = 0x8c90d8; // lilac cupboards
const WIN = 0x9aa0e6; // window frame
const SMOKE = 0x66626e;

/** P.block wrapped in a group, so that stage.put / fit can place it by its bottom-centre origin. */
function box(w: number, h: number, d: number, color: number) {
  const g = new THREE.Group();
  g.add(P.block(w, h, d, color));
  return g;
}

/** Flat lilac cupboard door with a round knob; origin bottom centre. */
function cupDoor(w: number, h: number, knob: "left" | "right" = "right") {
  const g = new THREE.Group();
  g.add(box(w, h, 0.04, CUP), P.block(w * 0.8, h * 0.9, 0.01, 0x9ea2e4, 0, h * 0.05, 0.01));
  g.add(P.orb(0.035, 0.035, 0.02, 0x8a80b0, (knob === "right" ? 1 : -1) * w * 0.34, h * 0.5, 0.03));
  return g;
}

// ---------------------------------------------------------------- K05: POV through the kitchen door (S05), push-in on the oven (S06)

defineStage("K05", (s) => {
  s.cam({ fov: 40, horizon: 0.44, bg: WALL });
  s.card(WALL, 5.45);
  s.floor(P.C.tile, 0.6, 5.4, { tiles: 0.95, line: P.C.tileLine });
  // left wall with the fridge, cupboard door, window, counter
  s.fit((w, h) => box(w, h, 0.05, WALL_DIM), [-0.4, -0.4, 0.26, 0.62], 5.3);
  s.fit((w, h) => box(w, h, 0.5, P.C.white), [0.05, -0.05, 0.21, 0.74], 3.6);
  s.fit((w, h) => box(0.03, h * 0.3, 0.03, P.C.steel), [0.15, 0.1, 0.16, 0.6], 3.58);
  s.fit((w, h) => cupDoor(w, h), [0.285, 0.09, 0.385, 0.575], 5.38);
  s.fit((w, h) => P.windowPiece(w, h, { frame: WIN, view: WALL }), [0.625, 0.05, 0.81, 0.45], 5.3);
  s.fit((w, h) => P.backdrop("street", w, h), [0.625, 0.05, 0.81, 0.45], 5.36);
  s.fit((w, h) => box(w, h, 0.5, CUP), [0.885, 0.41, 0.97, 0.61], 5.0);
  s.put(P.oven(), { at: [0.495, 0.625], depth: 4.75, h: 0.37 });
  const smokes = [0.455, 0.54].map((x) => s.put(P.smoke(0.5, 2.8, 28, SMOKE), { at: [x, 0.4], depth: 5.1 }));
  // the door the camera looks past, and its frame at the right edge
  const door = s.fit((w, h) => P.door(w, h, { hinge: "left", frame: false }), [-0.02, -0.5, 0.64, 1.4], 1.1);
  s.fit((w, h) => box(w, h, 0.1, P.C.doorFrame), [0.962, -0.5, 1.2, 1.5], 1.1);
  s.defaults.door = -115;
  s.on(({ f, vars }) => {
    P.setDoor(door, vars.door!);
    for (const m of smokes) P.animate(m, f, 0.8);
  });
});

/** Forearm in a suit sleeve with an open hand; origin at the palm, sleeve running down local -Y. */
function forearm() {
  const g = new THREE.Group();
  const skin = 0xe9b48c;
  g.add(P.orb(0.05, 0.055, 0.02, skin, 0, 0.02, 0));
  for (let i = 0; i < 4; i++) g.add(P.orb(0.012, 0.04, 0.012, skin, -0.036 + i * 0.024, 0.085 + (i === 1 || i === 2 ? 0.012 : 0), 0));
  g.add(P.orb(0.014, 0.035, 0.012, skin, 0.06, 0.03, 0).rotateZ(-0.7));
  g.add(P.cyl(0.05, 0.065, 0.7, 0x6f9fc4, 0, -0.74, 0));
  return g;
}

defineShot("S05", {
  vars: [
    { f: 319, door: -6 },
    { f: 321, to: 321, door: -20 },
    { f: 323, to: 323, door: -45 },
    { f: 325, to: 325, door: -75 },
    { f: 327, to: 327, door: -115 },
  ],
  props: [{
    make: forearm,
    keys: [
      { f: 319, at: [0.49, 0.72], depth: 0.75, scale: 0.8, rot: [0, 0, -62] },
      { f: 321, to: 321, at: [0.33, 0.68], rot: [0, 0, -50] },
      { f: 323, to: 323, at: [0.15, 0.66], rot: [0, 0, -22] },
      { f: 325, to: 325, at: [0.06, 0.66], rot: [0, 0, -8] },
      { f: 327, to: 327, at: [0.03, 0.68], rot: [0, 0, -4] },
    ],
  }],
});

defineShot("S06", {});

// ---------------------------------------------------------------- K06: the host's reaction in the doorway (S07)

defineStage("K06", (s) => {
  s.cam({ fov: 18, bg: 0x6f80dc });
  s.card(0x6f80dc, 3);
  s.fit((w, h) => box(w, h, 0.03, 0x8c9cec), [0.875, -0.3, 0.945, 1.3], 2.95);
  s.fit((w, h) => box(w, h, 0.06, 0xaab6f4), [0.945, -0.3, 1.2, 1.3], 2.9);
});

defineShot("S07", {
  actors: {
    host: {
      track: { k: 1.1 },
      keys: [
        { f: 351, pos: "track", lean: 0, open: 0, face: 50, head: [50, 0, 0], apron: true, eyes: [0.5, 0], lids: 0.05, brows: [0.3, 0], mouth: -0.7 },
        { f: 352, to: 352, head: [50, -8, 0], lids: 0.55, open: 0.4, brows: [-0.2, 0.4] },
        { f: 353, to: 353, lids: 1, open: 0.7 },
        { f: 354, to: 354, lids: 0.5, open: 0.6 },
        { f: 355, to: 355, head: [44, 5, 0], lids: 0, brows: [0.9, 0], open: 0.8, eyes: [0.4, 0] },
        { f: 363, to: 364, head: [46, 10, 0], eyes: [0.6, 0.5] },
        { f: 365, to: 366, brows: [0.8, 0.9] },
        { f: 367, to: 368, face: 85, head: [80, -6, 0], lean: 16 },
        { f: 368, to: 373, pos: [1.5, 0.52, 0.62] },
      ],
    },
  },
});

// ---------------------------------------------------------------- K07: from inside the oven (S08)

defineStage("K07", (s) => {
  const IN = 0x2b3394;
  s.cam({ fov: 18, bg: 0x8e9ad0 });
  s.card(0xa9b2dc, 5);
  // oven cavity: side walls and roof run from 0.9 m back to the opening at 1.7 m
  s.fit((w, h) => box(w, h, 0.8, IN), [-0.6, -0.9, -0.2, 1.5], 0.9);
  s.fit((w, h) => box(w, h, 0.8, IN), [1.2, -0.9, 1.6, 1.5], 0.9);
  s.fit((w, h) => box(w, h, 0.8, 0x232a80), [-0.6, -0.9, 1.6, -0.39], 0.9);
  s.put(P.roast(), { at: [0.5, 1.04], depth: 1.1, scale: 0.7 });
  const back = s.put(P.flames(0.5, 0.21, 8), { at: [0.5, 0.97], depth: 1.2 });
  const front = s.put(P.flames(0.4, 0.15, 6), { at: [0.5, 1.0], depth: 1.02 });
  const glow = s.fit((w, h) => P.glow(w, h, 0xff8a30, 0.22), [-0.2, -0.2, 1.2, 1.2], 0.8);
  const haze = s.fit((w, h) => P.glow(w, h, 0x4a55a8, 0.75), [-0.2, -0.2, 1.2, 1.2], 0.78);
  const wisps = [0.04, 0.95].map((x) => s.put(P.smoke(0.09, 0.5, 12, 0x8a8fc0), { at: [x, 0.95], depth: 1.6 }));
  s.defaults.fire = 0;
  s.defaults.haze = 0;
  s.on(({ f, vars }) => {
    P.animate(back, f, vars.fire!);
    P.animate(front, f, vars.fire!);
    P.animate(glow, f, vars.fire!);
    P.animate(haze, f, vars.haze!);
    for (const w of wisps) P.animate(w, f, 0.4 + 0.6 * vars.haze!);
  });
});

defineShot("S08", {
  actors: {
    host: {
      keys: [
        { f: 373, pos: [0.47, 0.35, 0.46], open: 0, teeth: 0, face: 0, lean: 28, head: [0, -14, 5], apron: true, eyes: [0.1, -0.7], lids: 0.02, brows: [0.5, 0.7], mouth: -0.5 },
        { f: 388, to: 389, pos: [0.48, 0.32, 0.46], brows: [0.8, 0.3], mouth: 0.4, open: 0.2 },
        { f: 394, to: 396, pos: [0.455, 0.35, 0.47], teeth: 1, open: 0.3 },
        { f: 397, to: 399, pos: [0.5, 0.36, 0.47] },
        { f: 400, to: 405, pos: [0.465, 0.35, 0.47], brows: [1, 0.3], teeth: 0, open: 0.1, mouth: 0 },
        { f: 406, to: 407, teeth: 1, open: 0.5, mouth: -0.4 },
        { f: 408, to: 409, pos: [0.46, 0.36, 0.46], head: [0, -8, 4], teeth: 0, open: 1 },
        { f: 410, to: 411, teeth: 1, open: 0.2, mouth: -0.6, head: [0, -14, 5] },
        { f: 418, to: 419, pos: [0.485, 0.36, 0.47], teeth: 0, open: 0.5 },
      ],
    },
  },
  vars: [
    { f: 373, fade: 0.72, haze: 1, fire: 0, light: 0.8 },
    { f: 376, to: 381, fade: 0 },
    { f: 382, to: 387, haze: 0.3 },
    { f: 386, to: 387, fire: 0.3 },
    { f: 388, to: 389, fire: 0.75, haze: 0, light: 1.25 },
    { f: 390, to: 391, fire: 1 },
  ],
});

// ---------------------------------------------------------------- K08: by the open oven, tilt up, pan to the window (S09)
// Reference picture = frame 424 (low, on the oven). After the tilt the frame shows ref y -0.48..0.52;
// by the end of the pan it shows ref x 0.5..1.5.

defineStage("K08", (s) => {
  s.cam({ fov: 18, bg: WALL });
  s.card(WALL, 4.2);
  s.fit((w, h) => cupDoor(w, h), [-0.12, -0.62, 0.22, -0.14], 3.9);
  s.fit((w, h) => cupDoor(w, h, "left"), [-0.12, -0.1, 0.22, 1.2], 3.9);
  s.fit((w, h) => box(w, h, 0.05, 0x7d83cc), [-0.3, -0.7, -0.12, 1.3], 3.92);
  const oven = s.put(P.oven(), { at: [0.46, 1.25], depth: 2.75, h: 1.0, yaw: -52 });
  P.setOvenDoor(oven, 1);
  s.fit((w, h) => P.windowPiece(w, h, { frame: WIN, view: WALL }), [1.0, -0.38, 1.49, 0.59], 4.1);
  s.fit((w, h) => P.backdrop("street", w, h), [1.0, -0.38, 1.49, 0.59], 4.16);
  const smokes = [
    s.put(P.smoke(0.55, 2.6, 20, SMOKE), { at: [0.66, 0.42], depth: 3.5 }),
    s.put(P.smoke(0.3, 1.6, 12, SMOKE), { at: [0.8, 0.5], depth: 3.3 }),
    s.put(P.smoke(0.22, 0.5, 10, SMOKE), { at: [0.47, 0.95], depth: 2.6 }),
  ];
  s.on(({ f }) => { for (const m of smokes) P.animate(m, f, 0.6); });
});

defineShot("S09", {
  actors: {
    host: {
      keys: [
        { f: 424, pos: [0.38, 0.36, 0.3], open: 0, teeth: 0, brows: [0, 0], legs: "stand", step: 0, face: 80, lean: 62, head: [85, -28, 0], apron: true, eyes: [0.2, -0.6], lids: 0.15, mouth: -0.3,
          armL: { at: [0.4, 0.88] }, armR: { at: [0.27, 0.84] }, handL: "grip", handR: "grip" },
        { f: 425, to: 427, pos: [0.37, 0.24, 0.3], lean: 4, face: 40, head: [40, 0, -8] },
        { f: 426, to: 426, armR: "chin", armL: { at: [0.44, 0.92] }, handR: "open", open: 0.5, lids: 0, eyes: [0.6, 0], brows: [0.8, 0.3] },
        { f: 427, to: 427, armR: "head", handR: "flat", armL: "down", handL: "open" },
        { f: 432, to: 433, head: [52, 0, -8], open: 0.3 },
        { f: 434, to: 435, teeth: 1, open: 0 },
        { f: 442, to: 444, pos: [0.345, 0.24, 0.3], head: [78, 0, -5], teeth: 0, open: 0.3 },
        { f: 448, to: 449, pos: [0.37, 0.24, 0.3], head: [40, 0, -8], open: 0.4 },
        { f: 450, to: 451, teeth: 1, open: 0 },
        { f: 454, to: 455, armR: { at: [0.3, 0.31] }, lids: 0.5, brows: [0, 0], armL: { at: [0.6, 0.9] }, handL: "flat" },
        { f: 456, to: 457, pos: [0.375, 0.22, 0.3], head: [42, 0, 0], armR: { at: [0.24, 0.68] }, armL: { at: [0.5, 0.63] }, handL: "grip", handR: "grip", lids: 1 },
        { f: 458, to: 459, armL: { at: [0.44, 0.41], z: 0.25 }, handL: "point", armR: { at: [0.3, 0.75] }, handR: "fist", lids: 0.45, eyes: [0.9, 0], teeth: 0, pos: [0.385, 0.25, 0.3] },
        { f: 462, to: 463, brows: [-0.3, -0.3], lids: 0.55, mouth: -0.2 },
        { f: 468, to: 469, armL: { at: [0.47, 0.46] }, handL: "open" },
        { f: 470, to: 471, pos: [0.42, 0.24, 0.3], face: 70, head: [72, 0, 0], armL: { at: [0.53, 0.72] }, mouth: -0.7, brows: [0, 0] },
        { f: 472, to: 477, pos: [0.36, 0.25, 0.3], face: 92, head: [90, 0, 0], lean: 12, legs: "walk", step: 2, armL: "down", armR: "down", handR: "open", lids: 0.2, eyes: [0.5, 0] },
        { f: 478, to: 483, pos: [0.48, 0.27, 0.3], face: 118, head: [105, 0, 0], step: 4, lids: 0.05 },
      ],
    },
  },
});

// ---------------------------------------------------------------- K09: at the window (S10)
// Reference picture = frame 484 (window fills the frame); after the pan the frame shows ref x -0.28..0.72.

defineStage("K09", (s) => {
  const wall = 0x7f9c9a;
  s.cam({ fov: 18, bg: P.C.sky });
  s.fit((w, h) => P.backdrop("street", w, h), [-0.02, -0.12, 1.04, 0.98], 8);
  s.fit((w, h) => box(w, h, 0.05, wall), [-1.2, -0.6, 0.07, 1.6], 2.6);
  s.fit((w, h) => box(w, h, 0.05, wall), [0.97, -0.6, 2, 1.6], 2.6);
  s.fit((w, h) => box(w, h, 0.05, wall), [-1.2, 0.92, 2, 1.6], 2.6);
  s.fit((w, h) => box(w, h, 0.12, WIN), [0.07, -0.6, 0.14, 0.82], 2.55);
  s.fit((w, h) => box(w, h, 0.12, WIN), [0.9, -0.6, 0.97, 0.82], 2.55);
  s.fit((w, h) => box(w, h, 0.2, 0xa9aeee), [0.05, 0.8, 0.99, 0.93], 2.5);
});

defineShot("S10", {
  actors: {
    host: {
      track: { k: 1.0 },
      keys: [
        { f: 484, lean: 0, teeth: 0, open: 0, armR: "down", handR: "open", face: 112, head: [102, 0, 0], eyes: [0.5, 0], lids: 0.03, brows: [0.3, 0], mouth: -0.8 },
        { f: 500, to: 501, lids: 0.5 },
        { f: 502, to: 504, lids: 0.82, head: [102, -6, 0] },
        { f: 526, to: 533, face: 45, head: [50, 0, 0], lids: 0.55, eyes: [0.8, 0], brows: [-0.2, -0.3], mouth: 0.5 },
        { f: 534, to: 537, armR: { at: [0.5, 0.9], z: 0.22 }, handR: "grip" },
        { f: 538, to: 539, mouth: 0.1 },
        { f: 554, to: 555, armR: { at: [0.48, 0.8], z: 0.22 }, handR: "point" },
        { f: 557, to: 558, armR: { at: [0.24, 0.88], z: 0.15 }, handR: "thumb" },
        { f: 573, to: 579, head: [56, -8, 5], lids: 0.7 },
        { f: 580, to: 582, head: [50, 0, 0], lids: 0.55 },
        { f: 585, to: 586, eyes: [0.6, -0.4] },
        { f: 604, to: 604, mouth: -0.6 },
        { f: 606, to: 606, mouth: 0.1 },
        { f: 610, to: 611, lids: 0.03, brows: [0.9, 0], eyes: [0.8, 0], mouth: 0 },
        { f: 647, to: 648, armR: "down", handR: "open", lids: 1 },
        { f: 650, to: 651, lids: 0.45, head: [50, 6, 0], brows: [0.3, 0] },
        { f: 666, to: 667, lids: 1, head: [50, 10, 0] },
        { f: 672, to: 673, lids: 0.75, head: [50, 0, 0], brows: [-0.2, -0.4], mouth: 0.6 },
        { f: 680, to: 684, mouth: 1 },
        { f: 685, to: 685, teeth: 1 },
        { f: 686, to: 686, lids: 1, open: 0.8 },
        { f: 688, to: 688, lids: 0.75, open: 0 },
        { f: 692, to: 693, head: [50, 4, 0] },
        { f: 694, to: 695, head: [50, -2, 0] },
        { f: 696, to: 697, head: [52, -9, 0] },
        { f: 700, to: 701, head: [50, 0, 0] },
        { f: 710, to: 710, lids: 0.25, open: 0.5 },
        { f: 711, to: 711, lids: 0.03, open: 0, brows: [0.7, 0], eyes: [0.8, 0] },
        { f: 712, to: 714, head: [60, -10, 6], lean: 8, brows: [-0.5, -1], mouth: 1, teeth: 1 },
        { f: 721, to: 721, teeth: 0, mouth: 0.7 },
        { f: 723, to: 723, teeth: 1 },
        { f: 727, to: 727, teeth: 0 },
        { f: 729, to: 729, teeth: 1 },
        { f: 732, to: 733, teeth: 0, mouth: 0, open: 0.25 },
      ],
      blinks: [583, 630],
    },
  },
});

// ---------------------------------------------------------------- K10: the kitchen wall, wide (S11)

defineStage("K10", (s) => {
  s.cam({ fov: 18, horizon: 0.3, bg: WALL });
  s.card(WALL, 7.5);
  s.floor(P.C.tile, 0.88, 7.4, { tiles: 0.9, line: P.C.tileLine });
  const win = s.fit((w, h) => P.windowPiece(w, h, { frame: WIN, view: WALL }), [0.43, -0.12, 0.75, 0.6], 7.3);
  s.fit((w, h) => P.backdrop("street", w, h), [0.43, -0.12, 0.75, 0.6], 7.36);
  P.setSash(win, 1);
  s.put(P.oven(), { at: [0.13, 0.913], depth: 7.0, h: 0.5, yaw: -28 });
  const smoke = s.put(P.smoke(0.7, 2.6, 22, 0x77708a), { at: [0.07, 0.56], depth: 7.1 });
  const apron = s.put(P.cloth(), { at: [0.25, 0.53], depth: 6.6, h: 0.3 });
  s.defaults.apron = 0;
  s.on(({ f, vars }) => {
    P.animate(smoke, f, 1);
    apron.visible = vars.apron! > 0.5;
  });
});

defineShot("S11", {
  actors: {
    host: {
      keys: [
        { f: 738, pos: [0.56, 0.2, 0.135], holdL: null, holdR: null, footL: null, handL: "open", handR: "open", eyes: [0, 0], face: 112, lean: 55, head: [100, 12, 0], apron: true, lids: 0.1, mouth: -0.4,
          armL: { at: [0.67, 0.44] }, armR: { at: [0.65, 0.47] } },
        { f: 740, to: 741, pos: [0.54, 0.14, 0.135], lean: 18, armL: { at: [0.66, 0.39] }, armR: { at: [0.63, 0.4] } },
        { f: 742, to: 742, pos: [0.5, 0.11, 0.135], lean: 0, face: 125, head: [70, 0, 0], armL: { at: [0.6, 0.3] }, armR: { at: [0.57, 0.32] } },
        { f: 743, to: 743, pos: [0.47, 0.13, 0.135], face: 30, head: [10, 0, 0], armL: "chest", armR: "chest" },
        { f: 744, to: 744, pos: [0.5, 0.15, 0.135], face: -40, head: [-65, 0, 0], armL: "back", armR: "back", eyes: [-0.5, 0] },
        { f: 746, to: 746, face: -10, head: [25, 0, 0], armL: "belly", armR: "belly", eyes: [0.6, 0] },
        { f: 747, to: 747, pos: [0.53, 0.15, 0.135], armR: "head", armL: "down" },
        { f: 748, to: 749, pos: [0.59, 0.25, 0.135], face: 60, lean: 42, head: [60, -20, 0], armR: { at: [0.63, 0.135] }, armL: { at: [0.66, 0.18] }, handL: "grip", handR: "grip" },
        { f: 749, to: 749, apron: false, holdL: "cloth" },
        { f: 750, to: 750, pos: [0.6, 0.17, 0.135], face: 80, lean: 32, head: [80, -10, 0], armL: { at: [0.71, 0.37] }, armR: { at: [0.66, 0.35] } },
        { f: 751, to: 751, pos: [0.535, 0.14, 0.135], face: 0, lean: 4, head: [0, 0, 0], holdL: null, holdR: "cloth", armR: { at: [0.4, 0.36] }, armL: { at: [0.67, 0.33] }, handL: "open" },
        { f: 752, to: 752, pos: [0.5, 0.13, 0.135], armR: { at: [0.3, 0.42] } },
        { f: 753, to: 753, pos: [0.455, 0.13, 0.135], holdR: null, handR: "open", armR: { at: [0.27, 0.43] }, armL: { at: [0.67, 0.47] }, lids: 0.03, mouth: -0.3 },
        { f: 758, to: 758, pos: [0.5, 0.15, 0.135], armR: "down", armL: "down", head: [10, -15, 0] },
        { f: 759, to: 759, pos: [0.54, 0.2, 0.135], face: 50, lean: 30, head: [50, -20, 0], armR: { at: [0.37, 0.52] }, armL: { at: [0.62, 0.56] }, handR: "fist", handL: "fist" },
        { f: 760, to: 760, pos: [0.5, 0.19, 0.135], face: 60, lean: 16, footL: { at: [0.63, 0.74], z: 0.1 }, armR: { at: [0.42, 0.47] }, armL: { at: [0.58, 0.34] } },
        { f: 761, to: 761, pos: [0.47, 0.17, 0.135], footL: { at: [0.6, 0.68], z: 0.1 }, armR: { at: [0.44, 0.6] }, armL: { at: [0.5, 0.36] } },
      ],
    },
  },
  vars: [{ f: 738, apron: 0 }, { f: 753, to: 753, apron: 1 }],
});

// ---------------------------------------------------------------- K11: from outside, through the window (S12)

defineStage("K11", (s) => {
  const house = 0xa9a6dc, frame = 0xcfcdea;
  s.cam({ fov: 18, bg: 0x2c3a8c });
  s.card(0x2c3a8c, 7);
  // far kitchen wall with the doorway
  s.fit((w, h) => box(w, h, 0.05, WALL), [-1, -1, 0.2, 2], 5.6);
  s.fit((w, h) => box(w, h, 0.05, WALL), [0.47, -1, 2, 2], 5.6);
  s.fit((w, h) => box(w, h, 0.05, WALL), [0.19, -1, 0.48, 0.1], 5.6);
  s.fit((w, h) => box(w, h, 0.08, P.C.doorFrame), [0.17, 0.07, 0.2, 1], 5.55);
  s.fit((w, h) => box(w, h, 0.08, P.C.doorFrame), [0.47, 0.07, 0.5, 1], 5.55);
  s.fit((w, h) => box(w, h, 0.08, P.C.doorFrame), [0.17, 0.07, 0.5, 0.1], 5.55);
  const door = s.fit((w, h) => P.door(w, h, { hinge: "right", frame: false }), [0.2, 0.1, 0.47, 1], 5.58);
  // window frame and house wall around it
  s.fit((w, h) => box(w, h, 0.05, house), [-0.3, -0.3, 0.045, 1.3], 2.7);
  s.fit((w, h) => box(w, h, 0.05, house), [0.9, -0.3, 1.3, 1.3], 2.7);
  s.fit((w, h) => box(w, h, 0.12, frame), [0.04, -0.2, 0.09, 1.2], 2.68);
  s.fit((w, h) => box(w, h, 0.12, frame), [0.82, -0.2, 0.905, 1.2], 2.68);
  s.fit((w, h) => box(w, h, 0.12, frame), [0.04, -0.2, 0.905, 0.03], 2.68);
  s.fit((w, h) => box(w, h, 0.2, frame), [0.02, 0.95, 0.93, 1.2], 2.66);
  s.defaults.door = 0;
  s.on(({ vars }) => P.setDoor(door, vars.door!));
});

defineShot("S12", {
  actors: {
    host: {
      keys: [
        { f: 762, pos: [0.7, 0.05, 0.5], brows: [0, 0], face: -40, lean: 25, head: [-45, -15, 8], lids: 0.3, eyes: [-0.3, -0.6], mouth: -0.4,
          armL: { at: [0.8, 0.46], z: 0 }, handL: "grip", armR: { at: [0.42, 0.85], z: 0.4 }, footR: { at: [0.55, 0.97], z: 0.4 } },
        { f: 764, to: 771, pos: [0.71, 0.07, 0.5], armR: { at: [0.3, 0.72], z: 0.4 } },
        { f: 766, to: 766, footR: { at: [0.59, 0.86], z: 0.5 } },
        { f: 769, to: 769, footR: { at: [0.62, 0.76], z: 0.55 } },
        { f: 772, to: 777, pos: [0.69, 0.1, 0.5], armR: { at: [0.2, 0.72], z: 0.4 } },
        { f: 774, to: 774, footR: { at: [0.5, 0.8], z: 0.6 } },
        { f: 778, to: 778, pos: [0.6, 0.2, 0.5], head: [-50, -25, 10], lean: 65, armL: { at: [0.82, 0.25], z: 0 }, armR: { at: [0.2, 0.7], z: 0.45 }, footR: { at: [0.4, 0.98], z: 0.5 }, lids: 0.1 },
        { f: 780, to: 780, pos: [0.57, 0.27, 0.5], footR: { at: [0.36, 1.06], z: 0.5 }, armR: { at: [0.18, 0.72], z: 0.45 }, lids: 0.03, eyes: [-0.5, -0.6] },
        { f: 782, to: 783, lids: 0.5, eyes: [-1, 0] },
        { f: 784, to: 784, lids: 1, pos: [0.585, 0.27, 0.5] },
        { f: 786, to: 786, lids: 0.5, brows: [0, -0.5] },
        { f: 788, to: 788, lids: 0, eyes: [-0.7, -0.5], brows: [0.8, 0.2], pos: [0.6, 0.26, 0.5] },
      ],
    },
    guest: {
      keys: [
        { f: 762, show: false, pos: [0.24, 0.32, 0.13], armR: "down", armL: "down", handL: "open", lean: 0, face: 70, head: [62, 0, 0], lids: 0.4, eyes: [0.6, 0] },
        { f: 774, to: 776, show: true, pos: [0.235, 0.32, 0.13] },
        { f: 778, to: 778, pos: [0.3, 0.31, 0.15], armR: { at: [0.4, 0.5] }, lids: 0.6 },
        { f: 780, to: 780, pos: [0.3, 0.33, 0.155], armR: "down", armL: { at: [0.43, 0.52] }, handL: "flat" },
        { f: 784, to: 785, pos: [0.335, 0.32, 0.16], lean: 12, armL: { at: [0.52, 0.57] }, handL: "open" },
        { f: 786, to: 787, pos: [0.325, 0.32, 0.16], armL: { at: [0.56, 0.56] }, handL: "grip", lids: 0.5 },
      ],
    },
  },
  vars: [
    { f: 762, door: 0 },
    { f: 772, to: 777, door: 50 },
    { f: 778, to: 778, door: 100 },
  ],
});

// ---------------------------------------------------------------- K12: the guest at the kitchen door (S13)

defineStage("K12", (s) => {
  const door = 0x8d7aa8;
  s.cam({ fov: 18, bg: door });
  s.card(door, 3);
  s.fit((w, h) => box(w, h, 0.02, 0x806c9c), [0.03, -0.3, 0.72, 1.3], 2.98);
  s.fit((w, h) => box(w, h, 0.03, 0x7f6b9b), [0.86, -0.3, 0.93, 1.3], 2.95);
  s.fit((w, h) => box(w, h, 0.06, 0x8f9be2), [0.93, -0.3, 0.955, 1.3], 2.92);
  s.fit((w, h) => box(w, h, 0.08, 0xa3acea), [0.955, -0.3, 1.2, 1.3], 2.9);
});

defineShot("S13", {
  actors: {
    guest: {
      track: { k: 0.9 },
      keys: [
        { f: 796, face: 48, head: [50, 0, 0], lids: 0, eyes: [0.35, 0], brows: [0.5, 0], mouth: 0 },
        { f: 803, to: 803, lids: 0.35, head: [53, 0, 0] },
        { f: 804, to: 804, lids: 0.62, eyes: [0.7, 0], brows: [-0.3, -0.25], mouth: -0.4 },
        { f: 808, to: 810, head: [49, 0, 0] },
      ],
    },
  },
});
