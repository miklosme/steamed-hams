// kitchen_b shots: front door from inside (S02), dining room wide (S04, S22), the kitchen
// confrontation (S15-S21) and the napkin close-up (S23).
import * as THREE from "three";
import * as P from "../pieces";
import { defineShot, defineStage } from "../dsl";
import type { Stage, Rect } from "../stage";

// ---------------------------------------------------------------- shared builders

/** P.block wrapped in a group, so `put` / `fit` keep its bottom-centre origin. */
function box(w: number, h: number, d: number, color: number) { const g = new THREE.Group(); g.add(P.block(w, h, d, color)); return g; }
/** Rest values for a first key: a field first keyed later would otherwise hold that later value from the start. */
const rest = { lean: 0, sway: 0, open: 0, teeth: 0, armL: "down", armR: "down", handL: "open", handR: "open" } as const;

/** A wall at `depth` with a doorway cut out at ref rect `r`; returns nothing, the door goes in separately. */
function wallWithHole(s: Stage, r: Rect, depth: number, color: number) {
  s.fit((w, h) => box(w, h, 0.1, color), [-3, -3, r[0], 4], depth);
  s.fit((w, h) => box(w, h, 0.1, color), [r[2], -3, 4, 4], depth);
  s.fit((w, h) => box(w, h, 0.1, color), [r[0], -3, r[2], r[1]], depth);
}

/** Open sash window looking at the street: frame from blocks, far painted street so a distant figure can stand in front of it. */
function streetWindow(s: Stage, r: Rect, depth: number, o: { wall?: number; sash?: number; street?: Rect; far?: number } = {}) {
  const [x0, y0, x1, y1] = r, t = (x1 - x0) * 0.07, ty = t * 1.6;
  const wall = o.wall ?? P.C.wallGreen;
  s.fit((w, h) => box(w, h, 0.1, wall), [-3, -3, x0, 4], depth);
  s.fit((w, h) => box(w, h, 0.1, wall), [x1, -3, 4, 4], depth);
  s.fit((w, h) => box(w, h, 0.1, wall), [x0, -3, x1, y0], depth);
  s.fit((w, h) => box(w, h, 0.1, wall), [x0, y1, x1, 4], depth);
  const fr = (q: Rect, d = 0.04) => s.fit((w, h) => box(w, h, 0.08, P.C.trim), q, depth - d);
  fr([x0, y0, x0 + t, y1]); fr([x1 - t, y0, x1, y1]); fr([x0, y0, x1, y0 + ty]);
  fr([x0 - t * 0.5, y1 - ty * 0.6, x1 + t * 0.5, y1 + ty * 0.6], 0.1); // sill
  // raised lower sash: two rails and a centre bar in the upper part
  const sy = o.sash ?? y0 + (y1 - y0) * 0.38;
  fr([x0, sy - ty * 0.5, x1, sy + ty * 0.5], 0.06);
  fr([(x0 + x1) / 2 - t * 0.3, y0, (x0 + x1) / 2 + t * 0.3, sy], 0.05);
  const far = o.far ?? 150;
  s.fit((w, h) => P.backdrop("street", w, h), o.street ?? [x0 - 0.15, y0 - 0.1, x1 + 0.15, y1 + 0.12], far);
}

// ---------------------------------------------------------------- K02: front door from inside

defineStage("K02", (s) => {
  s.cam({ fov: 18, bg: 0x20203a });
  const D = 2.1, r: Rect = [0.18, -0.6, 0.7, 1.6];
  wallWithHole(s, [0.16, -3, 0.72, 4], D, P.C.wallBlue);
  s.fit((w, h) => box(w, h, 0.06, P.C.doorFrame), [0.1, -3, 0.18, 4], D - 0.03);
  s.fit((w, h) => box(w, h, 0.06, P.C.doorFrame), [0.7, -3, 0.75, 4], D - 0.03);
  s.fit((w, h) => P.backdrop("sky", w, h), [-0.5, -0.5, 1, 0.6], 12);
  const g = s.rect(r, D);
  const d = s.fit((w, h) => P.door(w, h, { frame: false, hinge: "right", knob: false, color: 0x6a4fa0 }), r, D);
  const pivot = d.userData.pivot as THREE.Group;
  pivot.add(P.block(0.07, 0.11, 0.02, P.C.brass, -g.w * 0.9, g.h * 0.27, 0.02), P.orb(0.035, 0.035, 0.035, P.C.brass, -g.w * 0.88, g.h * 0.3, 0.06));
  s.defaults.door = 0;
  s.on(({ vars }) => P.setDoor(d, vars.door!));
});

defineShot("S02", {
  actors: {
    host: {
      keys: [
        { ...rest, f: 46, face: -90, head: [-88, 0, 0], apron: true, eyes: [-0.3, 0], lids: 0.02, brows: [0.2, 0], mouth: -0.4, legs: "walk", step: 0 },
        { f: 47, to: 62, step: 4 },
        { f: 57, to: 60, armR: { at: [0.38, 0.8], z: 0.1 }, handR: "open" },
        { f: 61, to: 62, armR: { at: [0.24, 0.94], z: 0.05 }, handR: "grip" },
        { f: 63, legs: "stand", lids: 0.25, brows: [-0.2, -0.2] },
        { f: 68, to: 72, lean: -5, armR: { at: [0.33, 0.95], z: 0.3 } },
      ],
    },
    guest: {
      keys: [
        { f: 46, pos: [0.22, 0.31, 0.3], face: 80, head: [70, 0, 0], eyes: [0.5, 0], lids: 0.5, brows: [-0.4, -0.5], mouth: -0.6,
          armL: "chest", handL: "grip", holdL: "bottle" },
      ],
    },
  },
  vars: [{ f: 46, door: 0 }, { f: 68, to: 72, door: -42 }],
});

// ---------------------------------------------------------------- K04: dining room, wide (S04, S22)

defineStage("K04", (s) => {
  s.cam({ fov: 18, horizon: 0.64, bg: P.C.wallBlue });
  const D = 5.0, door: Rect = [0.5, 0.0, 0.72, 1.35];
  wallWithHole(s, door, D, P.C.wallBlue);
  s.card(P.C.wallGreen, D + 1.2, [0.3, -0.5, 1, 2]); // kitchen beyond the door
  s.floor(P.C.carpet, 1.36, D);
  s.fit((w, h) => box(w, h, 0.05, P.C.wallBlueDark), [0.45, -1, 0.462, 1.36], D - 0.02); // wall corner lines
  s.fit((w, h) => box(w, h, 0.05, P.C.wallBlueDark), [0.755, -1, 0.767, 1.36], D - 0.02);
  const d = s.fit((w, h) => P.door(w, h, { hinge: "left", knob: false, color: 0x8f7fb0, frame: P.C.wallBlueDark }), door, D - 0.02);
  s.fit((w, h) => P.picture(w, h, { art: "boat" }), [0.22, 0.24, 0.385, 0.54], D - 0.05);
  s.fit((w, h) => P.picture(w, h, { art: "red" }), [0.925, -0.02, 1.08, 0.42], D - 0.05);
  s.put(P.table(), { at: [0.585, 1.53], depth: 2.8, scale: 0.85 });
  s.put(P.chair(), { at: [0.77, 1.42], depth: 3.7, scale: 0.9, yaw: -20 }); // far chair, facing the camera
  const chair = s.put(P.chair(), { at: [0.17, 1.54], depth: 2.0, scale: 0.55, yaw: 160 });
  s.defaults.door = 0;
  s.defaults.chair = 0;
  s.on(({ vars }) => {
    P.setDoor(d, vars.door!);
    chair.position.copy(s.point(0.17 + vars.chair! * 0.03, 1.54, 2.0));
  });
});

const bucket = (at: [number, number]) => ({ make: () => P.iceBucket(), keys: [{ f: 0, at, depth: 2.6, h: 0.23 }] });

defineShot("S04", {
  actors: {
    guest: {
      keys: [
        { ...rest, f: 288, pos: [-0.2, 0.2, 0.28], face: 70, head: [80, -10, 0], lean: 10, eyes: [0.3, -0.5], lids: 0.4, brows: [-0.3, -0.5], mouth: -0.5,
          armL: { at: [0.02, 0.72] }, handL: "grip", armR: "chest", handR: "grip", holdR: "bottle", legs: "walk", step: 0 },
        { f: 290, armL: { at: [0.1, 0.68] } },
        { f: 292, to: 297, pos: [0.06, 0.22, 0.26], step: 2, armL: { at: [0.2, 0.7] } },
        { f: 298, to: 302, pos: [0.13, 0.2, 0.26], lean: 20, face: 80, armR: { at: [0.26, 0.42] }, legs: "stand" },
        { f: 303, to: 307, pos: [0.3, 0.25, 0.26], lean: 45, armR: { at: [0.53, 0.62], z: -0.3 } },
        { f: 308, holdR: null, handR: "open" },
        { f: 309, to: 310, pos: [0.27, 0.22, 0.26], lean: 25, armR: { at: [0.44, 0.52], z: -0.2 } },
        { f: 311, to: 313, pos: [0.3, 0.34, 0.28], face: 150, head: [120, 0, 0], lean: 5, armR: "lap", armL: { at: [0.42, 0.72] }, legs: "sit" },
        { f: 314, to: 316, pos: [0.3, 0.42, 0.3], face: 140, head: [110, 0, 0], armL: { at: [0.44, 0.85] }, handL: "open" },
      ],
    },
    host: {
      keys: [
        { ...rest, f: 288, pos: [-0.12, 0.08, 0.2], face: 80, head: [80, -8, 0], apron: true, eyes: [0.3, -0.4], brows: [0.3, 0.5], mouth: -0.3, legs: "walk", step: 0 },
        { f: 290, to: 297, pos: [0.17, 0.2, 0.2], step: 2 },
        { f: 298, to: 302, pos: [0.25, 0.2, 0.2], step: 3 },
        { f: 303, to: 308, pos: [0.38, 0.22, 0.2], step: 4, head: [80, -20, 0] },
        { f: 309, to: 312, pos: [0.47, 0.22, 0.2], step: 6, lean: 12 },
        { f: 313, to: 316, pos: [0.58, 0.3, 0.19], step: 8, face: 110, armR: { at: [0.63, 0.42], z: -0.3 }, handR: "open" },
        { f: 316, to: 318, head: [40, 0, 0], eyes: [-0.6, 0], mouth: -0.5, legs: "stand", lean: 5 },
      ],
    },
  },
  vars: [{ f: 288, door: 0, chair: 0 }, { f: 311, to: 313, chair: 1 }, { f: 315, to: 318, door: 32 }],
  props: [
    bucket([0.56, 0.86]),
    { make: () => P.bottle(), keys: [{ f: 288, show: false, at: [0.565, 0.8], depth: 2.6, h: 0.26 }, { f: 308, show: true }] },
  ],
});

defineShot("S22", {
  actors: {
    guest: {
      keys: [
        { ...rest, f: 1686, pos: [0.31, 0.41, 0.3], face: 140, head: [100, 0, 0], legs: "sit", eyes: [0.5, 0], lids: 0.3, brows: [-0.2, -0.3], mouth: -0.3, bib: true,
          armL: { at: [0.41, 0.56], z: 0.3 }, armR: { at: [0.38, 0.58], z: 0.3 }, handL: "fist", handR: "fist" },
        { f: 1690, armL: { at: [0.41, 0.59], z: 0.3 } }, { f: 1694, armL: { at: [0.41, 0.55], z: 0.3 } }, { f: 1698, armL: { at: [0.41, 0.59], z: 0.3 } },
        { f: 1702, to: 1705, armL: "lap", armR: "lap" },
        { f: 1716, to: 1718, head: [105, 12, 0], lids: 0.05, eyes: [0.5, 0.3], brows: [0.3, 0] },
      ],
      blinks: [1712],
    },
    host: {
      keys: [
        { ...rest, f: 1686, show: false, pos: [0.7, 0.28, 0.2], face: -60, head: [-70, 0, 0], eyes: [-0.5, -0.2], lids: 0.05, brows: [0.5, 0], mouth: 0.6,
          armR: { at: [0.62, 0.56], z: 0.25 }, armL: { at: [0.68, 0.58], z: 0.25 }, handR: "flat", handL: "flat", holdR: "platter", legs: "walk", step: 0 },
        { f: 1704, show: true },
        { f: 1706, to: 1714, pos: [0.66, 0.27, 0.22], step: 2, armR: { at: [0.57, 0.56], z: 0.25 }, armL: { at: [0.65, 0.58], z: 0.25 } },
        { f: 1714, to: 1722, pos: [0.58, 0.21, 0.24], step: 5, teeth: 1, armR: { at: [0.52, 0.56], z: 0.25 }, armL: { at: [0.6, 0.57], z: 0.25 } },
        { f: 1722, to: 1730, pos: [0.555, 0.22, 0.24], step: 6, lean: 10, brows: [0.9, 0], armR: { at: [0.48, 0.57], z: 0.25 }, armL: { at: [0.57, 0.58], z: 0.25 }, legs: "stand" },
        { f: 1740, head: [-70, -4, 0] }, { f: 1746, head: [-70, 2, 0] }, { f: 1752, head: [-70, -3, 0] },
        { f: 1760, lids: 0.6, teeth: 0 },
        { f: 1762, to: 1764, lids: 1, pos: [0.55, 0.26, 0.24], head: [-65, -18, 0], mouth: 0.8 },
        { f: 1766, lids: 0.1, eyes: [-0.5, -0.5] },
        { f: 1768, lids: 0.55, eyes: [-0.3, -0.8] },
        { f: 1772, to: 1774, pos: [0.555, 0.23, 0.24], head: [-70, -5, 0], lids: 0.1, eyes: [-0.5, -0.3], teeth: 1, mouth: 1 },
      ],
    },
  },
  vars: [
    { f: 1686, door: 0 }, { f: 1702, to: 1716, door: -172 }, { f: 1728, to: 1738, door: 0 },
    { f: 1740, to: 1742, door: 22 }, { f: 1743, to: 1746, door: 0 },
  ],
  props: [
    bucket([0.49, 0.8]),
    { make: () => P.bottle(), keys: [{ f: 1686, at: [0.495, 0.74], depth: 2.6, h: 0.26 }] },
    { make: () => P.flute(), keys: [{ f: 1686, at: [0.535, 0.83], depth: 2.5, h: 0.2 }] },
    { make: () => P.flute(), keys: [{ f: 1686, at: [0.555, 0.84], depth: 2.5, h: 0.2 }] },
    { make: () => P.plate(), keys: [{ f: 1686, at: [0.67, 0.8], depth: 2.9, scale: 1.0 }] },
  ],
});

// ---------------------------------------------------------------- K14: host close-up at the window (S15)

defineStage("K14", (s) => {
  s.cam({ fov: 18, bg: P.C.sky });
  streetWindow(s, [0.13, -0.8, 1.6, 1.25], 1.9, { sash: 0.33, street: [-0.2, -0.35, 1.5, 1.0], far: 30 });
});

defineShot("S15", {
  actors: {
    host: {
      track: { k: 1.12 },
      keys: [
        { ...rest, f: 1180, to: 1180, face: -20, head: [55, -22, 8], eyes: [0.7, 0], lids: 0, brows: [0.6, 0.3], mouth: -0.2 },
        { f: 1181, to: 1182, head: [-45, 4, 0], eyes: [0, 0], open: 0.25, face: -35 },
        { f: 1183, to: 1183, head: [-45, 12, 0] },
        { f: 1184, to: 1186, head: [-45, 0, 0], eyes: [-0.4, 0], open: 0 },
        { f: 1209, to: 1209, head: [-40, 14, -8], teeth: 1, mouth: 0.6 },
        { f: 1210, to: 1211, head: [-48, -4, 8], brows: [0.9, 0.4] },
      ],
      blinks: [1196],
    },
  },
});

// ---------------------------------------------------------------- K15: over the guest's shoulder (S16)

defineStage("K15", (s) => {
  s.cam({ fov: 18, horizon: 0.55, bg: P.C.wallGreen });
  const D = 8.0;
  streetWindow(s, [0.665, 0.12, 0.9, 0.73], D, { street: [0.5, 0.28, 1.05, 0.78], far: 60 });
  s.floor(P.C.tile, 0.84, D, { tiles: 0.5, line: P.C.tileLine });
  s.fit((w, h) => box(w, h, 0.6, P.C.white), [-0.1, -0.2, 0.06, 0.84], D); // fridge
  s.put(P.oven(), { at: [0.45, 0.86], depth: D - 0.75, h: 0.4 });
  const sm = s.put(P.smoke(0.3, 1.5, 22), { at: [0.45, 0.56], depth: D - 0.9 });
  const sm2 = s.put(P.smoke(0.45, 0.5, 18), { at: [0.6, 0.2], depth: D - 0.9 });
  s.defaults.smoke = 1;
  s.on(({ f, vars }) => { P.animate(sm, f, vars.smoke!); P.animate(sm2, f * 0.6, vars.smoke! * 0.8); });
});

{
  const knee: [number, number] = [0.775, 0.52], foot: [number, number] = [0.84, 0.64], sill: [number, number] = [0.86, 0.5];
  defineShot("S16", {
    actors: {
      guest: {
        speak: false,
        keys: [{ f: 1216, pos: [0.25, 0.44, 0.56], face: 172, head: [150, 0, 0], eyes: [0.6, 0], lids: 0.4, brows: [-0.3, -0.6] }],
      },
      host: {
        track: { k: 0.7, oy: -0.45 },
        keys: [
          { ...rest, f: 1216, face: 20, head: [-45, 0, 0], eyes: [-0.5, 0], lids: 0.05, brows: [0.5, 0.3], footL: { at: foot, z: -0.35 },
            armL: { at: knee }, armR: { at: [knee[0] - 0.02, knee[1] + 0.02] }, lean: 10 },
          { f: 1232, to: 1233, lean: 18, head: [-50, -8, 0], teeth: 1, mouth: -0.4 },
          { f: 1234, to: 1235, face: 0, lean: 5, armR: "chest", armL: { at: foot }, teeth: 0 },
          { f: 1236, to: 1237, lean: 0, armR: { at: [0.655, 0.47] }, handR: "open", armL: { at: sill }, open: 0.2 },
          { f: 1238, to: 1240, face: -30, lean: 22, armR: { at: [0.6, 0.62] }, open: 0 },
          { f: 1245, to: 1246, lean: 4, armR: { at: [0.67, 0.45] }, handR: "fist" },
          { f: 1247, to: 1248, face: 0, head: [-10, 0, 0], armR: { at: [knee[0] - 0.03, knee[1] + 0.03] }, armL: { at: knee }, handR: "open", mouth: 0 },
          { f: 1249, to: 1251, face: 60, lean: 70, head: [0, -10, 20], armR: { at: foot }, armL: { at: [foot[0] + 0.01, foot[1] - 0.02] }, teeth: 1, mouth: 0.8 },
          { f: 1256, lean: 64 }, { f: 1260, lean: 72, head: [30, -30, 10] }, { f: 1264, lean: 64, head: [0, -10, 20] }, { f: 1268, lean: 72 },
          { f: 1272, to: 1275, face: -25, lean: 5, head: [-50, 0, 0], armL: { at: sill }, armR: "hip", handR: "fist", teeth: 0, open: 0.5 },
          { f: 1276, to: 1278, lean: -4, open: 0, teeth: 1, mouth: 1 },
          { f: 1280, to: 1282, lean: 14, head: [-50, 0, -10], teeth: 0 },
          { f: 1284, lean: 10 }, { f: 1286, lean: 15 },
          { f: 1289, to: 1291, lean: 0, head: [-45, 0, 0], armR: "chest" },
          { f: 1296, sway: 4 }, { f: 1301, sway: -3 },
          { f: 1307, to: 1310, sway: 0, face: 60, lean: 70, head: [0, -10, 20], armR: { at: foot }, armL: { at: [foot[0] + 0.01, foot[1] - 0.02] }, handR: "open", teeth: 1, mouth: 1 },
          { f: 1311, to: 1312, head: [40, -35, 0] },
          { f: 1313, to: 1314, lean: 76, head: [0, -10, 20] },
          { f: 1317, lean: 72 }, { f: 1320, lean: 76 },
        ],
      },
    },
  });
}

// ---------------------------------------------------------------- K16 / K18: guest in front of the kitchen door (S17, S19)

function guestAtDoor(s: Stage) {
  s.cam({ fov: 18, bg: P.C.wallGreen });
  const D = 2.3;
  s.card(P.C.wallGreen, D + 0.1);
  s.fit((w, h) => box(w, h, 0.08, P.C.doorFrame), [-0.2, -1.5, 0.065, 2.2], D);
  s.fit((w, h) => box(w, h, 0.08, P.C.doorFrame), [0.72, -1.5, 0.82, 2.2], D);
  s.fit((w, h) => P.door(w, h, { frame: false, knob: false, color: 0x7f6f9c }), [0.065, -1.2, 0.72, 2.0], D + 0.02);
  s.fit((w, h) => box(w, h, 0.02, P.C.white), [0.015, 0.8, 0.045, 0.93], D - 0.05); // switch plate
}
defineStage("K16", guestAtDoor);
defineStage("K18", guestAtDoor);

defineShot("S17", {
  actors: {
    guest: {
      track: { k: 1.08, oy: 0.08 },
      keys: [
        { ...rest, f: 1322, face: 25, head: [42, 0, 0], eyes: [0.6, 0], lids: 0.5, brows: [-0.4, -0.8], mouth: -0.8 },
        { f: 1331, head: [42, -4, 0] }, { f: 1335, head: [44, 2, 0] }, { f: 1339, head: [42, -3, 0] },
        { f: 1343, to: 1346, armL: { at: [0.62, 0.95] }, handL: "fist" },
        { f: 1347, to: 1348, armL: "chin", open: 0.2 },
        { f: 1349, to: 1350, armL: { at: [0.76, 0.5], z: 0.1 }, handL: "open", open: 0 },
        { f: 1351, to: 1352, armL: { at: [0.86, 0.7], z: 0.05 }, handL: "point" },
        { f: 1365, to: 1366, armL: { at: [0.93, 0.73], z: 0 }, lean: 6, sway: -5 },
      ],
      blinks: [1341],
    },
  },
});

defineShot("S19", {
  actors: {
    guest: {
      track: { k: 1.08, oy: 0.08 },
      speak: false,
      keys: [
        { ...rest, f: 1560, face: 25, head: [42, 0, 0], eyes: [0.6, 0], lids: 0.5, brows: [-0.4, -0.8], mouth: -0.8 },
        { f: 1562, to: 1564, lids: 0.68 },
        { f: 1577, to: 1580, face: -30, head: [-35, -12, 0], eyes: [-0.3, -0.6] },
        { f: 1581, to: 1584, face: -110, head: [-55, -10, 0], armR: { at: [0.25, 0.95] }, lean: 8 },
        { f: 1585, to: 1586, face: -150, head: [-95, -5, 0], armR: { at: [0.06, 0.9], z: -0.3 }, handR: "open" },
      ],
    },
  },
});

// ---------------------------------------------------------------- K17: host, stove and smoke (S18)

defineStage("K17", (s) => {
  s.cam({ fov: 18, bg: P.C.wallGreen });
  const D = 3.2;
  streetWindow(s, [0.7, -0.35, 1.3, 0.9], D, { sash: 0.33, street: [0.4, 0.32, 1.17, 0.95], far: 40 });
  s.put(P.oven(), { at: [0.2, 2.28], depth: 2.5 });
  const a = s.put(P.smoke(0.13, 0.8, 18), { at: [0.1, 0.82], depth: 2.3 });
  const b = s.put(P.smoke(0.12, 0.8, 18), { at: [0.33, 0.82], depth: 2.35 });
  s.defaults.smoke = 1;
  s.on(({ f, vars }) => { P.animate(a, f, vars.smoke!); P.animate(b, f + 37, vars.smoke!); });
});

defineShot("S18", {
  actors: {
    host: {
      keys: [
        { ...rest, f: 1385, face: -35, head: [-45, 0, 0], eyes: [-0.4, 0], lids: 0.02, brows: [0.5, 0.4], mouth: -0.4 },
        { f: 1387, to: 1388, lids: 1, lean: 6 },
        { f: 1389, to: 1390, lids: 0.5, eyes: [-0.7, 0], open: 0.5 },
        { f: 1391, to: 1392, lids: 0.02, lean: 16, teeth: 1, open: 0, armR: { at: [0.5, 0.93] }, armL: { at: [0.64, 0.95] }, handR: "fist", handL: "fist" },
        { f: 1399, teeth: 0, open: 0.4, mouth: -0.7 },
        { f: 1406, to: 1408, head: [-85, -15, 0], armR: { at: [0.42, 1.05] }, armL: { at: [0.55, 1.1] }, eyes: [-0.3, -0.5] },
        { f: 1409, to: 1410, lean: 2, armR: "down", armL: "down", open: 0, mouth: -0.2, handR: "open", handL: "open" },
        { f: 1411, to: 1414, lean: -2, head: [-105, 14, 0], eyes: [-0.3, 0.4], open: 0.15 },
        { f: 1419, to: 1419, head: [-45, 0, 0], eyes: [-0.5, 0], teeth: 1, open: 0 },
        { f: 1420, to: 1421, head: [-45, 8, 0], teeth: 0 },
        { f: 1422, to: 1423, face: -15, head: [-35, 0, 0], brows: [0.3, 0.9] },
        { f: 1424, to: 1426, face: -35, head: [-45, 0, 0], teeth: 1, mouth: -0.3 },
        { f: 1427, teeth: 0, mouth: 0, brows: [0.5, 0.2] },
        { f: 1455, mouth: 0.8 },
        { f: 1464, head: [-45, 5, 0], lids: 0 },
        { f: 1473, lids: 0.55 },
        { f: 1474, to: 1475, lids: 1, head: [-45, 12, 0], mouth: 0.9, brows: [0.7, 0] },
        { f: 1482, to: 1483, lids: 0.5, eyes: [-0.7, 0] },
        { f: 1484, to: 1487, lids: 0.02, head: [-45, 0, 0], sway: 6, armR: { at: [0.33, 0.92], z: 0.1 }, handR: "flat", teeth: 1 },
        { f: 1517, to: 1520, sway: 0, face: 0, head: [0, 0, 0], armR: "down", teeth: 0, mouth: 0.7, lids: 0.3, eyes: [0, 0] },
        { f: 1521, to: 1522, head: [35, 0, 8], armR: "belly", mouth: 0.4 },
        { f: 1526, head: [0, 0, 0], mouth: 0.8, armR: { rel: [-0.12, -0.36, 0.26] } },
        { f: 1529, head: [-35, 0, -8], armR: "belly" },
        { f: 1531, head: [0, 0, 0], armR: { rel: [-0.12, -0.36, 0.26] } },
        { f: 1535, head: [35, 0, 8], armR: "belly" },
        { f: 1539, to: 1540, head: [0, 0, 0], teeth: 1, mouth: 1, lids: 0.1 },
        { f: 1541, armR: "down" },
        { f: 1542, to: 1544, face: -35, head: [-45, 0, 0], eyes: [-0.5, 0], teeth: 0, lids: 0.02 },
        { f: 1546, mouth: 0.8 },
        { f: 1550, head: [-45, 4, 0] }, { f: 1553, head: [-45, -2, 0] },
        { f: 1557, teeth: 1, mouth: 1 },
      ],
      blinks: [1433, 1434],
    },
  },
});

// ---------------------------------------------------------------- K19: the swing door from the kitchen side (S20)

defineStage("K19", (s) => {
  s.cam({ fov: 18, bg: P.C.wallBlue });
  const D = 2.7, r: Rect = [0.1, -0.9, 0.63, 1.7];
  s.fit((w, h) => box(w, h, 0.1, P.C.wallBlue), [-3, -3, r[0], 4], D);
  s.fit((w, h) => box(w, h, 0.1, 0x7f6f9c), [r[2], -3, 0.745, 4], D);
  s.fit((w, h) => box(w, h, 0.1, P.C.doorFrame), [0.745, -3, 0.87, 4], D);
  s.fit((w, h) => box(w, h, 0.1, P.C.wallGreen), [0.87, -3, 4, 4], D + 0.02);
  s.card(P.C.wallBlueDark, D + 2.5); // dining room beyond
  const g = s.rect(r, D);
  const d = s.fit((w, h) => P.door(w, h, { frame: false, hinge: "right", knob: false, color: 0x7f6f9c }), r, D);
  (d.userData.pivot as THREE.Group).add(P.block(0.07, 0.16, 0.015, 0xb8b0cc, -g.w * 0.92, g.h * 0.3, 0.02));
  s.defaults.door = 0;
  s.on(({ vars }) => P.setDoor(d, vars.door!));
});

defineShot("S20", {
  actors: {
    guest: {
      speak: false,
      keys: [
        { f: 1587, show: true, pos: [0.33, 0.33, 0.52], face: -165, head: [-100, -5, 0], eyes: [-0.3, -0.5], lids: 0.5, brows: [-0.3, -0.6], mouth: -0.5, legs: "walk", step: 0 },
        { f: 1589, to: 1590, pos: [0.24, 0.31, 0.58], head: [-125, -5, 0], step: 1 },
        { f: 1591, to: 1592, pos: [0.04, 0.34, 0.62], step: 2 },
        { f: 1593, to: 1594, pos: [-0.1, 0.4, 0.64], step: 2.5 },
        { f: 1595, to: 1596, pos: [-0.32, 0.45, 0.66], step: 3 },
        { f: 1597, show: false },
      ],
    },
  },
  vars: [
    { f: 1587, door: -68 }, { f: 1588, to: 1597, door: 0 }, { f: 1599, to: 1603, door: 26 },
  ],
});

// ---------------------------------------------------------------- K20: the window, and the dash to the restaurant (S21)

defineStage("K20", (s) => {
  s.cam({ fov: 18, bg: P.C.sky });
  streetWindow(s, [0.19, -0.25, 0.85, 0.97], 2.3, { sash: 0.33, street: [0.1, 0.21, 0.92, 1.03], far: 150 });
  s.floorY = -200; // nothing stands on a floor here; lets the far figure's legs hang free
  const haze = s.put(P.smoke(0.12, 0.3, 12, 0x8a7f9c), { at: [0.06, 0.42], depth: 1.9 });
  s.defaults.smoke = 1;
  s.on(({ f, vars }) => P.animate(haze, f * 0.5, vars.smoke! * 0.7));
});

defineShot("S21", {
  actors: {
    host: {
      track: { k: 1.0 },
      keys: [
        { ...rest, f: 1604, show: true, pos: "track", footL: null, mouth: 0, face: 10, head: [15, 0, -10], eyes: [0.6, 0], lids: 0.55, brows: [0.3, 0.6], open: 0.15,
          armR: { at: [0.33, 0.2], z: 0.25 }, handR: "open" },
        { f: 1606, to: 1614, armR: { at: [0.25, 0.1], z: 0.2 }, head: [10, 0, 0] },
        { f: 1608, to: 1608, lids: 1 }, { f: 1610, to: 1610, lids: 0.6 },
        { f: 1614, mouth: 0.5, open: 0 },
        { f: 1621, to: 1621, lean: 15, lids: 0, eyes: [0.7, 0], mouth: 0, brows: [0.6, 0], armR: { at: [0.42, 0.2], z: 0.25 }, armL: { at: [0.75, 1.0] } },
        { f: 1623, to: 1624, face: 50, head: [60, 0, 0], armR: { at: [0.3, 0.6], z: 0.2 }, handR: "point", armL: { at: [0.68, 0.55], z: 0 }, handL: "open" },
        { f: 1625, to: 1626, face: 70, head: [75, 0, 0], lean: 15, armR: "down", handR: "open" },
        { f: 1627, to: 1629, face: 80, lean: 20, footL: { at: [0.62, 0.9], z: -0.3 }, armL: { at: [0.55, 0.3], z: -0.3 }, handL: "grip" },
        { f: 1630, to: 1631, lean: 45, head: [90, -25, 0], eyes: [0.3, -0.7] },
        { f: 1632, to: 1633, pos: [0.62, 0.45, 0.42], face: 170, head: null, lean: 60, armR: "head", armL: "head", footL: null, handL: "open" },
        { f: 1634, to: 1635, pos: [0.72, 0.6, 0.38], lean: 100, armL: { at: [0.6, 0.25], z: -0.2 } },
        { f: 1636, to: 1636, pos: [0.6, 0.62, 0.34], lean: 60 },
        { f: 1637, to: 1637, pos: [0.45, 0.7, 0.3], face: 60, lean: 10, head: [70, -30, 0], armL: { at: [0.6, 0.1], z: -0.1 }, armR: "down" },
        { f: 1638, to: 1638, pos: [0.5, 0.98, 0.3] },
        { f: 1639, to: 1639, pos: [0.52, 1.2, 0.3], armL: { at: [0.55, 0.9], z: -0.1 } },
        { f: 1640, show: false },
        // outside, far below on the lawn, then the run
        { f: 1656, to: 1656, show: true, pos: [0.55, 1.03, 0.05], face: 180, head: null, lean: 0, armL: "down", armR: "down", legs: "stand" },
        { f: 1657, to: 1663, pos: [0.56, 0.87, 0.055] },
        { f: 1664, to: 1672, pos: [0.64, 0.77, 0.03], legs: "walk", step: 9, face: 150, lean: 12 },
        { f: 1673, to: 1680, pos: [0.68, 0.72, 0.016], step: 17 },
        { f: 1681, to: 1685, pos: [0.69, 0.7, 0.01], step: 22 },
      ],
    },
  },
});

// ---------------------------------------------------------------- K21: guest close-up with the napkin (S23)

defineStage("K21", (s) => {
  s.cam({ fov: 18, bg: P.C.wallBlue });
  s.card(P.C.wallBlue, 2.6);
  s.fit((w, h) => P.ovalFrame(w, h, { fill: 0xb060a8 }), [0.15, -0.2, 0.42, 0.55], 2.5);
  s.fit((w, h) => box(w, h, 0.05, P.C.wood), [0.79, 0.83, 0.88, 1.2], 1.6, -30);
});

defineShot("S23", {
  actors: {
    guest: {
      track: { k: 0.86, oy: -0.04 },
      keys: [
        { ...rest, f: 1777, face: 40, head: [50, 0, 0], eyes: [0.4, -0.6], lids: 0.55, brows: [-0.2, 0], mouth: -0.4, bib: true,
          armR: { at: [0.3, 0.72], z: 0.1 }, handR: "fist" },
        { f: 1781, armR: { at: [0.3, 0.76], z: 0.1 } }, { f: 1785, armR: { at: [0.3, 0.71], z: 0.1 } },
        { f: 1789, armR: { at: [0.3, 0.76], z: 0.1 } }, { f: 1793, armR: { at: [0.3, 0.72], z: 0.1 } },
        { f: 1799, to: 1802, armR: { at: [0.3, 1.1] }, handR: "open", lids: 0.6 },
        { f: 1803, to: 1803, lids: 1, armR: "down" },
        { f: 1805, to: 1805, lids: 0.6, eyes: [0.7, 0] },
        { f: 1807, lids: 0.35, brows: [-0.4, -0.2], teeth: 1 },
        { f: 1813, to: 1815, head: [50, 9, 0], eyes: [0.6, 0.4], brows: [-0.3, -0.9], teeth: 0 },
        { f: 1829, to: 1830, head: [50, 3, 0] }, { f: 1831, to: 1832, head: [50, 9, 0] },
        { f: 1835, to: 1837, head: [50, 0, 0], eyes: [0.6, 0], lids: 0.5, brows: [-0.3, -0.3] },
      ],
    },
  },
});
