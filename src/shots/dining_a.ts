// Dining room, first half of the dinner: S24..S37.
import * as THREE from "three";
import * as P from "../pieces";
import { defineShot, defineStage } from "../dsl";
import type { PoseKey } from "../dsl";
import type { Stage } from "../stage";

// ---------------------------------------------------------------- local pieces

/** Ice bucket with a bottle leaning out of it. */
function bucket() {
  const g = P.iceBucket();
  const b = P.bottle();
  b.position.set(-0.01, 0.05, 0);
  b.scale.setScalar(1.25);
  b.rotation.z = 0.3;
  g.add(b);
  return g;
}
/** Single upright slat of a chair back, for chairs that only show as a post beside a shoulder. */
const post = (w: number, h: number) => P.block(w, h, 0.04, P.C.wood);
/** Top half of a burger bun, underside (lettuce, tomato) facing +Z. */
function bunTop() {
  const g = new THREE.Group();
  g.add(P.cyl(0.07, 0.07, 0.02, 0x5fae4a, 0, 0, 0), P.cyl(0.06, 0.06, 0.022, 0xd9a25a, 0, 0, 0), P.cyl(0.035, 0.035, 0.026, 0xd0402c, 0, 0, 0));
  const dome = P.orb(0.062, 0.062, 0.03, 0xd9a25a, 0, 0.011, -0.012);
  g.children.forEach((c) => c.rotateX(Math.PI / 2));
  g.add(dome);
  return g;
}
/** Patty on the bottom bun; lies flat, origin under it. */
function pattyBun() {
  return new THREE.Group().add(P.orb(0.062, 0.018, 0.062, 0xd9a25a, 0, 0.012, 0), P.cyl(0.066, 0.066, 0.02, 0x5a2e1c, 0, 0.022, 0), P.cyl(0.07, 0.07, 0.006, 0xc8402c, 0, 0.018, 0));
}

// ---------------------------------------------------------------- stages

// K22: over the guest's left shoulder toward the host and the closed door (S24, S40).
// Stage variable `flutes` (default 1) shows the two flutes by the bucket. The platter is a shot prop.
defineStage("K22", (s) => {
  s.cam({ fov: 18, horizon: 0.62, bg: P.C.wallBlue });
  s.card(P.C.wallBlue, 5.2);
  s.floorY = -5; // no floor in view: the standing host's legs hang straight behind the table
  s.fit((w, h) => P.door(w, h), [0.495, -0.3, 0.755, 1.4], 5.1);
  s.fit((w, h) => P.picture(w, h, { art: "fruit" }), [-0.03, 0.07, 0.255, 0.46], 5.1);
  s.put(P.table(), { at: [0.8, 1.7], depth: 3.0 });
  s.put(P.chair(), { at: [0.9, 1.52], depth: 3.6, yaw: -50 });
  s.put(P.chair(), { at: [0.14, 2.2], depth: 2.05, yaw: 150 });
  s.put(bucket(), { at: [0.44, 0.9], depth: 2.9 });
  const fl = [s.put(P.flute(), { at: [0.535, 0.89], depth: 2.9 }), s.put(P.flute(), { at: [0.558, 0.89], depth: 2.92 })];
  s.put(P.plate(), { at: [0.69, 0.91], depth: 2.85 });
  s.defaults.flutes = 1;
  s.on(({ vars }) => { for (const f of fl) f.visible = vars.flutes! > 0.5; });
});

// K23: medium close-up of the seated guest (S25, S27, S29, S31, S33, S35, S37, S39).
// Stage variables: `burgers` = how many bun tops show along the bottom edge (default 4),
// `flute` = the flute at the far left edge (default 1; S25 has none).
defineStage("K23", (s) => {
  s.cam({ fov: 18, bg: P.C.wallLilac });
  s.card(P.C.wallLilac, 7.2);
  s.floor(P.C.carpet, 0.84, 7.1);
  s.card(P.C.wallBlue, 4.5, [-3, -3, 0.57, 4]);
  s.card(P.C.trim, 4.48, [0.56, -3, 0.6, 4]);
  s.fit((w, h) => P.ovalFrame(w, h, { fill: 0xb04ab8 }), [0.0, -0.17, 0.225, 0.2], 4.4);
  s.fit((w, h) => P.ovalFrame(w, h, { frame: 0xb04a9a, fill: 0x58b0a8 }), [0.868, 0.085, 0.925, 0.245], 7.1);
  const arm = P.armchair();
  arm.scale.set(0.62, 1, 0.8);
  s.put(new THREE.Group().add(arm), { at: [0.815, 0.87], depth: 6.3, h: 0.5, yaw: 60 });
  s.put(P.lamp(), { at: [0.91, 0.85], depth: 6.6, h: 0.5 });
  s.fit(post, [0.145, 0.59, 0.2, 1.1], 2.0);
  s.fit((w, h) => P.block(w, h, 0.03, P.C.wood), [0.145, 0.63, 0.34, 0.69], 2.0);
  const buns = [0.37, 0.53, 0.7, 0.87, 1.02].map((x, i) => s.put(P.burger(), { at: [x, 1.12 + (i % 2) * 0.01], depth: 1.2 }));
  s.fit((w, h) => P.block(w, h, 0.02, P.C.cloth), [-0.1, 0.965, 0.32, 1.1], 1.25);
  const fl = s.put(P.flute(), { at: [0.07, 1.03], depth: 1.6 });
  s.defaults.burgers = 5;
  s.defaults.flute = 1;
  s.on(({ vars }) => {
    buns.forEach((b, i) => { b.visible = i < vars.burgers!; });
    fl.visible = vars.flute! > 0.5;
  });
});

// K24 / K25 / K28: medium close-up of the seated host; the same wall, different table dressing.
function hostCloseUp(s: Stage, o: { flute?: [number, number]; burgers?: boolean }) {
  s.cam({ fov: 18, bg: P.C.wallBlue });
  s.card(P.C.wallBlue, 5);
  s.fit((w, h) => P.door(w, h, { frame: false, hinge: "left" }), [-0.25, -0.5, 0.265, 1.6], 4.9);
  s.card(0x8a7fc0, 4.88, [0.265, -3, 0.3, 4]);
  s.card(P.C.trim, 4.87, [0.3, -3, 0.345, 4]);
  s.fit((w, h) => P.picture(w, h, { art: "red" }), [0.815, -0.12, 1.04, 0.37], 4.9);
  s.fit(post, [0.4, 0.64, 0.445, 1.1], 2.1);
  s.fit(post, [0.82, 0.64, 0.87, 1.1], 2.1);
  if (o.flute) s.put(P.flute(), { at: o.flute, depth: 1.6 });
  if (o.burgers) for (const x of [0.17, 0.33, 0.5, 0.66]) s.put(P.burger(), { at: [x, 1.17], depth: 1.2 });
}
defineStage("K24", (s) => hostCloseUp(s, { flute: [0.22, 1.01], burgers: true }));
defineStage("K25", (s) => hostCloseUp(s, { flute: [0.22, 1.09] }));
defineStage("K28", (s) => hostCloseUp(s, {}));

// K26: wide side-on two-shot of the whole table (S32). Level camera; the floor is 0.69 m under the table top.
defineStage("K26", (s) => {
  s.cam({ fov: 18, bg: P.C.wallBlue });
  s.card(P.C.wallBlue, 9.4);
  s.floor(P.C.carpet, 0.73, 9.4);
  s.card(P.C.wallLilac, 9.3, [-3, -3, 0.03, 0.74]);
  s.card(P.C.trim, 9.3, [0.9, -3, 0.93, 0.74]);
  s.fit((w, h) => P.door(w, h, { frame: false }), [0.93, -0.3, 1.25, 0.74], 9.3);
  s.fit((w, h) => P.picture(w, h, { art: "landscape" }), [0.36, 0.11, 0.635, 0.39], 9.35);
  s.put(P.table({ r: 0.8, h: 0.69 }), { at: [0.49, 0.93], depth: 5.05 });
  s.put(P.chair(), { at: [0.1, 0.93], depth: 5.05, yaw: 90, scale: 1.1 });
  s.put(P.chair(), { at: [0.885, 0.93], depth: 5.05, yaw: -90, scale: 1.1 });
  s.put(bucket(), { at: [0.535, 0.5], depth: 5.1 });
  s.put(P.plate(), { at: [0.475, 0.5], depth: 4.9 });
  s.put(P.burger(), { at: [0.475, 0.495], depth: 4.9 });
  s.put(P.flute(), { at: [0.325, 0.5], depth: 4.95 });
});

// K27: over the guest's shoulder from a little higher, the table top open at lower right (S34).
defineStage("K27", (s) => {
  s.cam({ fov: 18, horizon: 0.8, bg: P.C.wallBlue });
  s.card(P.C.wallBlue, 5.2);
  s.fit((w, h) => P.door(w, h), [0.495, -0.4, 0.755, 1.4], 5.1);
  s.fit((w, h) => P.picture(w, h, { art: "fruit" }), [-0.05, -0.12, 0.21, 0.28], 5.1);
  // everything on the table is a child of it: x to screen right, z toward the camera, 0.76 = the top
  const t = s.put(P.table(), { at: [0.78, 1.66], depth: 2.75 });
  const on = (o: THREE.Object3D, x: number, z: number, scale = 1) => { o.position.set(x, 0.76, z); o.scale.setScalar(scale); t.add(o); return o; };
  on(bucket(), -0.5, -0.12);
  on(P.platter(0), -0.12, 0.08, 1.3);
  on(P.burger(), -0.2, 0.1);
  on(P.flute(), -0.36, 0.3);
  const hostFlute = on(P.flute(), -0.27, -0.2);
  s.put(P.chair(), { at: [0.9, 1.35], depth: 3.4, yaw: -50 });
  s.put(P.chair(), { at: [0.14, 2.25], depth: 1.75, yaw: 150 });
  s.defaults.hostFlute = 1;
  s.on(({ vars }) => { hostFlute.visible = vars.hostFlute! > 0.5; });
});

// ---------------------------------------------------------------- shots

defineShot("S24", {
  actors: {
    guest: {
      keys: [
        { f: 1843, pos: [0.2, 0.36, 0.3], face: 150, head: [98, 10, 0], legs: "sit", eyes: [0.5, 0.4], lids: 0.05, armL: "lap", armR: "lap", mouth: -0.2 },
        { f: 1913, to: 1914, lids: 1 },
        { f: 1915, to: 1918, pos: [0.2, 0.375, 0.3], head: [100, -8, 0], lids: 0.6, eyes: [0.4, -0.5] },
      ],
      speak: false,
    },
    host: {
      keys: [
        { f: 1843, pos: [0.72, 0.22, 0.23], legs: "stand", face: -30, head: [-50, 0, 0], lean: 12, eyes: [-0.6, -0.1], lids: 0.05, brows: [0.5, 0], mouth: 0.9, teeth: 1,
          armR: { at: [0.42, 0.52], z: 0.35 }, armL: { at: [0.94, 0.5], z: 0.35 }, handL: "grip", handR: "grip" },
        { f: 1845, to: 1853, pos: [0.63, 0.34, 0.23], lean: 38, face: -20, armR: { at: [0.44, 0.76], z: 0.5 }, armL: { at: [0.9, 0.86], z: 0.4 }, teeth: 0, mouth: 0 },
        { f: 1847, eyes: [-0.2, -0.7] },
        { f: 1855, eyes: [-0.6, 0], mouth: 0.6, head: [-55, 4, 0] },
        { f: 1869, to: 1872, head: [-55, 10, -4], pos: [0.635, 0.335, 0.23], mouth: 0.9 },
        { f: 1880, to: 1884, head: [-55, 6, -2], pos: [0.63, 0.345, 0.23] },
        { f: 1890, to: 1894, head: [-55, 11, -4], pos: [0.64, 0.33, 0.23] },
        { f: 1909, to: 1913, pos: [0.72, 0.27, 0.23], lean: 8, face: -30, head: [-55, 2, 0], teeth: 1,
          armR: { at: [0.5, 0.76], z: 0.4 }, armL: { at: [0.93, 0.82], z: 0.3 }, handL: "open", handR: "open" },
        { f: 1915, to: 1918, pos: [0.8, 0.4, 0.23], lean: 0, legs: "sit", face: -45, armR: "lap", armL: "lap", teeth: 0, mouth: 0.3 },
        { f: 1919, to: 1922, pos: [0.79, 0.385, 0.23] },
        { f: 1931, mouth: 0.5 },
        { f: 1939, mouth: 0.9, teeth: 1 },
      ],
      blinks: [1859, 1904],
    },
  },
  props: [{
    make: () => P.platter(),
    keys: [
      { f: 1843, at: [0.68, 0.61], depth: 2.9, scale: 1.45 },
      { f: 1845, to: 1849, at: [0.66, 0.8] },
      { f: 1850, to: 1855, at: [0.68, 0.98] },
    ],
  }],
});

const seatedGuest: PoseKey = { f: 0, face: 42, legs: "sit", bib: true, armL: "lap", armR: "lap" };

defineShot("S25", {
  actors: {
    guest: {
      keys: [
        { ...seatedGuest, f: 1945, pos: [0.45, 0.255, 0.45], head: [50, -12, 0], eyes: [0.2, -0.7], lids: 0.55, brows: [0, 0], mouth: -0.2 },
        { f: 1951, to: 1954, head: [58, 2, 0], pos: [0.455, 0.245, 0.45] },
        { f: 1953, eyes: [0.7, 0.1], brows: [-0.4, -0.2] },
        { f: 1965, to: 1976, brows: [-0.6, -0.7], head: [58, -2, 0] },
        { f: 1997, head: [56, -6, 0], brows: [-0.3, 0], pos: [0.45, 0.255, 0.45] },
        { f: 2001, eyes: [0.2, -0.7], lids: 0.55, teeth: 1, mouth: -0.6 },
      ],
      blinks: [1977],
    },
  },
  vars: [{ f: 1945, flute: 0 }],
});

const seatedHost: PoseKey = { f: 0, face: -40, legs: "sit", armL: "lap", armR: "lap" };

defineShot("S26", {
  actors: {
    host: {
      keys: [
        { ...seatedHost, f: 2007, pos: [0.61, 0.36, 0.47], head: [-52, 0, 0], eyes: [-0.6, 0], lids: 0.02, brows: [0.6, 0], mouth: 0.5 },
        { f: 2011, to: 2012, head: [-52, 5, 0], pos: [0.605, 0.35, 0.47] },
        { f: 2013, to: 2014, head: [-52, 0, 0], pos: [0.61, 0.36, 0.47] },
        { f: 2015, mouth: 0.9, teeth: 1 },
        { f: 2025, to: 2027, lids: 0.5, brows: [0.1, 0], head: [-52, 6, 0], armR: { at: [0.31, 0.82], z: 0.35 }, handR: "thumb" },
        { f: 2031, to: 2033, armR: { at: [0.36, 0.62], z: 0.3 }, handR: "fist", teeth: 0, head: [-55, -4, 4] },
        { f: 2037, to: 2038, armR: { at: [0.18, 0.76], z: 0.45 }, handR: "flat", lids: 1, teeth: 1, mouth: 0.9, head: [-52, 0, 0] },
        { f: 2039, to: 2040, lids: 0.5 },
        { f: 2041, lids: 0.02, brows: [0.6, 0], teeth: 0 },
        { f: 2046, head: [-52, 4, 0] }, { f: 2050, head: [-52, 0, 0] },
        { f: 2055, teeth: 1, mouth: 1 },
      ],
    },
  },
});

defineShot("S27", {
  actors: {
    guest: {
      keys: [
        { ...seatedGuest, f: 2059, pos: [0.455, 0.25, 0.45], head: [58, 0, 0], eyes: [0.6, 0], lids: 0.25, brows: [0, 0], mouth: -0.5 },
        { f: 2061, to: 2064, open: 0.7 },
        { f: 2063, to: 2068, head: [58, 8, 0] },
        { f: 2069, to: 2076, head: [58, 0, 0], open: 0.2 },
        { f: 2077, open: 0 },
        { f: 2081, open: 0.3 },
        { f: 2082, to: 2083, lids: 1 },
        { f: 2085, to: 2086, head: [5, 0, 5], lids: 0.5, open: 0.25, pos: [0.47, 0.25, 0.45] },
        { f: 2087, to: 2089, head: [-42, 0, 0], lids: 0.25, brows: [-0.5, -0.3], eyes: [0.9, 0], open: 0, pos: [0.47, 0.245, 0.45] },
      ],
    },
  },
});

defineShot("S28", {
  actors: {
    host: {
      keys: [
        { ...seatedHost, f: 2105, pos: [0.61, 0.36, 0.47], head: [-52, 0, 0], eyes: [-0.6, 0], lids: 0.5, brows: [0.1, 0.3], mouth: 0.8, teeth: 1 },
        { f: 2107, teeth: 0, mouth: 0.6 },
        { f: 2109, teeth: 1, head: [-52, -3, 0] },
        { f: 2110, to: 2112, eyes: [0.8, 0], teeth: 0, open: 0.3, mouth: 0 },
        { f: 2121, to: 2123, lids: 1, open: 0 },
        { f: 2125, lids: 0.02, eyes: [-0.6, 0], brows: [0.7, 0], mouth: 0.8, head: [-52, 4, 0] },
        { f: 2130, head: [-52, 1, 0] }, { f: 2133, head: [-52, 4, 0] },
        { f: 2135, mouth: -0.2, open: 0.15 },
        { f: 2139, mouth: 0.3, open: 0 },
      ],
    },
  },
});

defineShot("S29", {
  actors: {
    guest: {
      keys: [
        { ...seatedGuest, f: 2145, pos: [0.455, 0.25, 0.45], head: [58, 0, 0], eyes: [0.6, 0], lids: 0.2, brows: [0, 0], mouth: -0.4 },
        { f: 2149, head: [58, -4, 0] },
        { f: 2150, to: 2153, lids: 0.5 },
        { f: 2181, to: 2184, lids: 0.2, brows: [0.3, 0] },
        { f: 2185, to: 2194, lids: 0, brows: [0.9, 0.2], head: [58, 7, 0], pos: [0.455, 0.24, 0.45] },
        { f: 2201, to: 2209, lids: 0.5, brows: [-0.3, 0], head: [58, -2, 0], pos: [0.455, 0.25, 0.45] },
        { f: 2215, to: 2218, brows: [-0.6, -0.7], lids: 0.55 },
        { f: 2220, head: [58, -5, 0] }, { f: 2224, head: [58, -1, 0] }, { f: 2228, head: [58, -4, 0] },
        { f: 2231, to: 2232, armL: { at: [0.66, 0.5], z: 0.3 }, handL: "fist" },
        { f: 2233, to: 2234, armL: { at: [0.84, 0.56], z: 0.3 }, handL: "flat" },
        { f: 2240, armL: { at: [0.84, 0.58], z: 0.3 } }, { f: 2246, armL: { at: [0.84, 0.55], z: 0.3 } },
        { f: 2254, armL: { at: [0.84, 0.58], z: 0.3 } }, { f: 2260, armL: { at: [0.84, 0.56], z: 0.3 } },
        { f: 2265, teeth: 1, mouth: -0.6 },
      ],
      blinks: [2176, 2246],
    },
  },
});

defineShot("S30", {
  actors: {
    host: {
      keys: [
        { ...seatedHost, f: 2271, pos: [0.6, 0.36, 0.47], head: [-52, 0, 0], eyes: [-0.6, 0], lids: 0.02, brows: [0.5, 0], mouth: 0.2 },
        { f: 2272, to: 2276, lids: 0.5, eyes: [-0.9, 0], brows: [0, 0], head: [-52, 5, 0] },
        { f: 2280, head: [-52, 2, 0] },
        { f: 2284, to: 2285, lids: 0.9, head: [-52, 5, 0] },
        { f: 2288, lids: 0.5 },
        { f: 2296, to: 2298, lids: 1, head: [-52, -6, 0], pos: [0.6, 0.37, 0.47] },
        { f: 2302, to: 2303, armR: { at: [0.4, 0.86], z: 0.3 }, handR: "fist" },
        { f: 2304, to: 2306, armR: { at: [0.39, 0.63], z: 0.3 }, teeth: 1 },
        { f: 2307, to: 2311, armR: { at: [0.28, 0.64], z: 0.4 }, handR: "open", teeth: 0 },
        { f: 2309, to: 2310, lids: 0.02, brows: [0.7, 0], mouth: 0.8, head: [-52, 2, 0], pos: [0.6, 0.36, 0.47], eyes: [-0.6, 0] },
        { f: 2312, to: 2315, armR: { at: [0.16, 0.8], z: 0.45 }, handR: "flat" },
      ],
    },
  },
});

defineShot("S31", {
  actors: {
    guest: {
      keys: [
        { ...seatedGuest, f: 2330, pos: [0.455, 0.25, 0.45], head: [58, 0, 0], eyes: [0.6, 0], lids: 0.5, brows: [-0.5, -0.2], mouth: -0.4 },
        { f: 2335, to: 2338, head: [58, 6, 0], open: 0.3 },
        { f: 2342, to: 2344, head: [58, 0, 0], lids: 0.85, open: 0 },
        { f: 2345, to: 2347, lids: 0.5 },
      ],
    },
  },
});


defineShot("S32", {
  actors: {
    guest: {
      keys: [
        { f: 2354, pos: [0.15, 0.115, 0.15], face: 90, head: [82, 0, 0], legs: "sit", bib: true, eyes: [0.5, 0], lids: 0.4, brows: [-0.3, 0], mouth: -0.2,
          armR: { at: [0.29, 0.46] }, armL: { at: [0.3, 0.46] }, handR: "fist", handL: "fist" },
        { f: 2357, to: 2362, lean: 22, pos: [0.19, 0.125, 0.15], armR: { at: [0.44, 0.44] }, handR: "open", eyes: [0.4, -0.5] },
        { f: 2363, handR: "grip", holdR: "burger" },
        { f: 2364, to: 2369, lean: 0, pos: [0.15, 0.115, 0.15], armR: { at: [0.27, 0.38] }, armL: { at: [0.29, 0.38] }, head: [82, -12, 0] },
        { f: 2372, to: 2373, armR: { at: [0.235, 0.25] }, armL: { at: [0.25, 0.25] }, open: 0.8, head: [82, -6, 0] },
        { f: 2374, to: 2375, open: 0, lean: 6, pos: [0.16, 0.12, 0.15] },
        { f: 2378, to: 2381, armR: { at: [0.26, 0.33] }, armL: { at: [0.275, 0.33] }, lean: 0, pos: [0.15, 0.115, 0.15], open: 0.1 },
        { f: 2380, open: 0 }, { f: 2382, open: 0.1, armR: { at: [0.28, 0.38] }, armL: { at: [0.295, 0.38] } }, { f: 2384, open: 0 },
      ],
      speak: false,
    },
    host: {
      keys: [
        { f: 2354, pos: [0.82, 0.125, 0.14], face: -90, head: [-82, 0, 0], legs: "sit", eyes: [-0.5, 0], lids: 0.3, mouth: 0.1,
          armR: { at: [0.7, 0.46] }, armL: { at: [0.72, 0.46] }, handR: "fist", handL: "fist" },
        { f: 2356, to: 2359, armR: { at: [0.7, 0.4] }, handR: "grip", holdR: "flute" },
        { f: 2360, to: 2363, armR: { at: [0.72, 0.3] } },
        { f: 2364, to: 2367, armR: { at: [0.75, 0.27] } },
        { f: 2368, to: 2369, head: [-82, 28, 0], lids: 1, armR: { at: [0.76, 0.25] }, pos: [0.83, 0.12, 0.14] },
      ],
      speak: false,
    },
  },
  props: [
    { make: () => P.flute(), keys: [{ f: 2354, at: [0.69, 0.5], depth: 4.95 }, { f: 2356, to: 2356, show: false }] },
    { make: () => P.burger(), keys: [{ f: 2354, at: [0.735, 0.5], depth: 4.9 }] },
  ],
});

// The opened burger: patty on the bottom bun (on the guest's right palm) and the top bun (left hand).
const HAND_Z = 1.42;
const pattyRest = { at: [0.6, 0.845] as [number, number], rot: [12, 0, 0] as [number, number, number] };

defineShot("S33", {
  actors: {
    guest: {
      keys: [
        { ...seatedGuest, f: 2386, pos: [0.455, 0.25, 0.45], head: [58, 0, 0], eyes: [0.6, 0], lids: 0.5, brows: [0, 0], mouth: 0.5,
          armL: { at: [0.7, 0.76], z: 0.3 }, handL: "grip", holdL: "burger" },
        { f: 2390, armL: { at: [0.7, 0.75], z: 0.3 }, open: 0.1 }, { f: 2394, armL: { at: [0.7, 0.77], z: 0.3 }, open: 0 },
        { f: 2398, armL: { at: [0.7, 0.75], z: 0.3 }, open: 0.1 }, { f: 2401, armL: { at: [0.7, 0.76], z: 0.3 }, open: 0 },
        { f: 2404, to: 2407, head: [55, -14, 0], eyes: [0.1, -0.7], mouth: -0.2, armR: { at: [0.5, 0.9], z: 0.32 }, handR: "flat" },
        { f: 2408, to: 2411, armL: { at: [0.66, 0.74], z: 0.3 }, armR: { at: [0.54, 0.88], z: 0.32 } },
        { f: 2412, to: 2415, armL: { at: [0.87, 0.8], z: 0.3 }, holdL: null },
        { f: 2434, to: 2436, armR: { at: [0.52, 0.74], z: 0.32 } },
        { f: 2458, to: 2459, lids: 0.5, eyes: [0.6, 0], brows: [-0.5, -0.2] },
        { f: 2460, to: 2463, armR: { at: [0.54, 0.88], z: 0.32 }, head: [58, 0, 0] },
      ],
      blinks: [2455],
    },
  },
  vars: [{ f: 2386, burgers: 1 }],
  props: [
    { make: pattyBun, keys: [
      { f: 2386, show: false, at: [0.6, 0.8], depth: HAND_Z, scale: 0.9, rot: [12, 0, 0] },
      { f: 2412, to: 2412, show: true },
      { f: 2412, to: 2415, at: pattyRest.at },
      { f: 2434, to: 2436, at: [0.58, 0.7] },
      { f: 2460, to: 2463, at: pattyRest.at },
    ] },
    { make: bunTop, keys: [
      { f: 2386, show: false, at: [0.62, 0.74], depth: HAND_Z, scale: 0.85, rot: [-80, 0, 0] },
      { f: 2412, to: 2412, show: true },
      { f: 2412, to: 2415, at: [0.87, 0.66], rot: [0, -20, 0] },
    ] },
  ],
});

defineShot("S34", {
  actors: {
    guest: {
      keys: [{ f: 2486, pos: [0.21, 0.21, 0.36], face: 150, head: [100, 0, 0], legs: "sit", eyes: [0.5, 0], lids: 0.3, armL: "lap", armR: "lap" }],
      speak: false,
    },
    host: {
      keys: [
        { ...seatedHost, f: 2486, pos: [0.72, 0.38, 0.25], head: [-45, -22, 8], lean: 12, lids: 1, mouth: 0.8, brows: [0.3, 0.3],
          armR: { at: [0.6, 0.72], z: 0.4 }, handR: "grip" },
        ...[2489, 2493, 2499, 2509, 2514].map((f): PoseKey => ({ f: f - 2, to: f, head: [-45, -12, 6], pos: [0.72, 0.365, 0.25], teeth: 1 })),
        ...[2491, 2496, 2503, 2511].map((f): PoseKey => ({ f: f - 1, to: f, head: [-45, -24, 8], pos: [0.72, 0.385, 0.25], teeth: 0 })),
        { f: 2516, to: 2520, lids: 0.6, eyes: [-0.6, 0.3], head: [-45, -20, 8], pos: [0.72, 0.38, 0.25], teeth: 0 },
        { f: 2521, to: 2530, head: [-40, 0, 0], pos: [0.75, 0.275, 0.25], lean: 0, mouth: 0.7 },
        { f: 2531, lids: 0.02, eyes: [-0.6, 0], brows: [0.7, 0] },
        { f: 2540, head: [-40, 4, 0] }, { f: 2546, head: [-40, 0, 0] }, { f: 2552, head: [-40, 4, 0] }, { f: 2558, head: [-40, 0, 0] },
        { f: 2568, to: 2572, armR: { at: [0.63, 0.64], z: 0.35 }, holdR: "flute" },
        { f: 2584, open: 0.5, brows: [1, 0] },
        { f: 2586, open: 0, lids: 0.5, brows: [0.3, 0] },
        { f: 2588, to: 2589, face: -10, head: [0, 0, 0], pos: [0.745, 0.3, 0.25], lids: 0.02, eyes: [-0.8, 0], open: 0.4, armR: { at: [0.67, 0.6], z: 0.35 } },
        { f: 2590, to: 2591, head: [10, 0, 14], pos: [0.7, 0.285, 0.25], teeth: 1, armR: { at: [0.68, 0.62], z: 0.35 } },
        { f: 2592, to: 2594, head: [45, 4, -8], pos: [0.665, 0.3, 0.25], eyes: [0.6, 0.7], teeth: 0, open: 0, armR: { at: [0.71, 0.63], z: 0.35 } },
        { f: 2599, to: 2599, eyes: [-0.6, -0.4] },
        { f: 2600, to: 2601, eyes: [0.6, 0.7] },
      ],
      blinks: [2562],
    },
  },
  vars: [{ f: 2486, hostFlute: 1 }, { f: 2568, to: 2568, hostFlute: 0 }],
});

defineShot("S35", {
  actors: {
    guest: {
      keys: [
        { ...seatedGuest, f: 2609, pos: [0.455, 0.25, 0.45], head: [58, 0, 0], eyes: [0.6, 0], lids: 0.2, brows: [0, 0], mouth: -0.3,
          armL: { at: [0.8, 0.78], z: 0.3 }, handL: "grip", armR: { at: [0.54, 0.88], z: 0.32 }, handR: "flat" },
        { f: 2613, to: 2621, lids: 0.5, brows: [-0.3, 0] },
        { f: 2624, to: 2626, eyes: [0.5, 0.8] },
        { f: 2630, to: 2632, eyes: [0.6, 0], brows: [-0.5, -0.2] },
        { f: 2636, head: [58, -3, 0] }, { f: 2642, head: [58, 1, 0] }, { f: 2648, head: [58, -3, 0] }, { f: 2655, head: [58, 0, 0] },
      ],
      blinks: [2657],
    },
  },
  vars: [{ f: 2609, burgers: 1 }],
  props: [
    { make: pattyBun, keys: [{ f: 2609, at: pattyRest.at, depth: HAND_Z, scale: 0.9, rot: pattyRest.rot }] },
    { make: bunTop, keys: [{ f: 2609, at: [0.8, 0.65], depth: HAND_Z, scale: 0.85, rot: [0, -20, 0] }] },
  ],
});

defineShot("S36", {
  actors: {
    host: {
      keys: [
        { ...seatedHost, f: 2674, pos: [0.58, 0.37, 0.46], head: [-52, 0, 0], eyes: [-0.6, 0], lids: 0.02, brows: [0.7, 0], mouth: 0.8, open: 0.2,
          armR: { at: [0.2, 0.74], z: 0.05 }, handR: "grip", holdR: "flute" },
        { f: 2676, to: 2677, lean: 6, pos: [0.565, 0.375, 0.46], armR: { at: [0.185, 0.75], z: 0.05 } },
        { f: 2678, to: 2679, lean: 0, pos: [0.58, 0.37, 0.46], armR: { at: [0.2, 0.74], z: 0.05 }, open: 0.6 },
        { f: 2680, open: 0.4, teeth: 1 },
        { f: 2684, to: 2685, open: 0, mouth: 1, lean: 5, pos: [0.568, 0.375, 0.46], armR: { at: [0.188, 0.75], z: 0.05 } },
        { f: 2686, to: 2687, lean: 0, pos: [0.58, 0.37, 0.46], armR: { at: [0.2, 0.74], z: 0.05 } },
      ],
    },
  },
});

defineShot("S37", {
  actors: {
    guest: {
      keys: [
        { ...seatedGuest, f: 2690, pos: [0.455, 0.25, 0.45], head: [58, 0, 0], eyes: [0.6, 0], lids: 0.25, brows: [-0.5, -0.5], mouth: -0.4,
          armL: { at: [0.8, 0.78], z: 0.3 }, handL: "grip", armR: { at: [0.54, 0.88], z: 0.32 }, handR: "flat" },
        { f: 2704, to: 2708, lean: 8, pos: [0.48, 0.265, 0.46], armL: { at: [0.9, 0.8], z: 0.35 }, handL: "flat" },
        { f: 2706, brows: [-0.8, -1], lids: 0.05 },
        { f: 2730, to: 2731, lids: 0.8 },
        { f: 2730, to: 2735, armL: { at: [0.82, 0.8], z: 0.3 }, handL: "grip" },
        { f: 2732, to: 2733, lids: 1, teeth: 1 },
        { f: 2734, to: 2735, lids: 0.7, teeth: 0 },
        { f: 2736, to: 2739, brows: [-0.2, 0], lids: 0.5, eyes: [0.2, -0.7], lean: 3, pos: [0.465, 0.26, 0.45] },
        { f: 2752, eyes: [0.6, 0] },
        { f: 2754, to: 2759, head: [58, -10, 0], armR: { at: [0.46, 0.86], z: 0.34 }, armL: { at: [0.84, 0.97], z: 0.3 }, handL: "flat" },
        { f: 2760, to: 2762, head: [58, 0, 0], brows: [-0.6, -0.6], lids: 0.5 },
      ],
      blinks: [2776],
    },
  },
  vars: [{ f: 2690, burgers: 1 }],
  props: [
    { make: pattyBun, keys: [
      { f: 2690, at: pattyRest.at, depth: HAND_Z, scale: 0.9, rot: pattyRest.rot },
      { f: 2754, to: 2759, at: [0.5, 0.8], rot: [80, 0, 0], scale: 1.15 },
    ] },
    { make: bunTop, keys: [
      { f: 2690, at: [0.8, 0.65], depth: HAND_Z, scale: 0.85, rot: [0, -20, 0] },
      { f: 2704, to: 2708, at: [0.92, 0.76], rot: [-75, 0, 0] },
      { f: 2730, to: 2735, at: [0.82, 0.66], rot: [0, -20, 0] },
      { f: 2754, to: 2759, at: [0.86, 0.93], rot: [-70, 0, 0] },
    ] },
  ],
});
