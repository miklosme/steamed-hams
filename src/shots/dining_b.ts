// dining_b shots: the excuse and the kitchen door (S38), the guest rising and pointing (S39, S40),
// the escalating close-ups (S41-S48).
import * as THREE from "three";
import * as P from "../pieces";
import { defineShot, defineStage } from "../dsl";

const FIRE = 0xff6a2a, FIRE_PINK = 0xff5a6a;
/** Group raw meshes so that Stage.put does not overwrite their own offset and scale. */
const G = (...kids: THREE.Object3D[]) => new THREE.Group().add(...kids);

// K29: over the guest's shoulder at the dining table, the kitchen door behind the host.
// Reference picture is frame 2785 (before the tilt); after the tilt screen y = ref y + 0.128.
// Depths: guest 2.0, table 2.28, seated host 2.5, standing host 2.65, wall and door 3.0, kitchen fire 3.7.
defineStage("K29", (s) => {
  s.cam({ fov: 18, horizon: 0.6, bg: P.C.wallBlue });
  const D: [number, number, number, number] = [0.47, -0.095, 0.775, 1.5];
  const WALL = 2.9;
  // the wall, with a hole where the door is
  s.card(P.C.wallBlue, WALL, [-3, -3, D[0], 4]);
  s.card(P.C.wallBlue, WALL, [D[2], -3, 4, 4]);
  s.card(P.C.wallBlue, WALL, [D[0], -3, D[2], D[1]]);
  // the burning kitchen behind it
  s.card(FIRE, 3.9, [0.2, -0.6, 1.1, 2]);
  const fire = s.fit((w, h) => P.flames(w, h, 6), [0.4, -0.05, 0.92, 1.3], 3.7);
  const fireGlow = s.fit((w, h) => P.glow(w, h, 0xffc23a, 0.55), [0.4, 0.5, 0.92, 1.3], 3.65);
  const door = s.fit((w, h) => P.door(w, h, { hinge: "left", color: 0x8a6a8c }), D, WALL);
  // light leaking round the closed door, and the wash over whoever stands in the doorway
  const leakTop = s.fit((w, h) => P.glow(w, h, FIRE_PINK, 0.95), [D[0] - 0.01, D[1] - 0.028, D[2] + 0.02, D[1] - 0.008], WALL - 0.12);
  const leakCorner = s.fit((w, h) => P.glow(w, h, 0xe0303a, 0.95), [D[2] - 0.02, D[1] - 0.04, D[2] + 0.025, D[1] + 0.03], WALL - 0.12);
  const leakSide = s.fit((w, h) => P.glow(w, h, FIRE_PINK, 0.9), [D[2] - 0.004, D[1], D[2] + 0.022, 1.3], WALL - 0.12);
  const tint = s.fit((w, h) => P.glow(w, h, 0xff7a3a, 0.5), [D[0], D[1], D[2], 1.3], WALL + 0.05);
  const smokeL = s.put(P.smoke(0.035, 0.75, 10, 0xdcdcec), { at: [0.42, 0.72], depth: WALL - 0.1 });
  const smokeR = s.put(P.smoke(0.03, 0.6, 8, 0xdcdcec), { at: [0.8, 0.5], depth: WALL - 0.1 });
  s.fit((w, h) => P.picture(w, h, { art: "fruit" }), [-0.03, -0.14, 0.245, 0.4], WALL - 0.02);
  // table: an upright ellipse, so it can sit between two characters who are nearly the same size
  s.put(G(P.orb(0.47, 0.15, 0.015, P.C.cloth)), { at: [0.63, 1.0], depth: 2.28 });
  s.put(P.platter(6), { at: [0.7, 0.9], depth: 2.26, scale: 0.75, rot: [22, 0, 0] });
  s.put(P.flute(), { at: [0.535, 0.99], depth: 2.24, h: 0.15 });
  s.put(P.iceBucket(), { at: [0.425, 0.77], depth: 2.25, h: 0.15 });
  s.put(P.bottle(), { at: [0.415, 0.7], depth: 2.25, h: 0.4, rot: [0, 0, 14] });
  s.put(P.chair(), { at: [0.09, 1.56], depth: 1.8, scale: 0.55, yaw: 160 });
  const chair = s.put(P.chair(), { at: [0.83, 1.5], depth: 2.42, scale: 0.72, yaw: -20 });
  Object.assign(s.defaults, { door: 0, leak: 0, side: 0, tint: 0, smokeL: 0, smokeR: 0, chair: 0 });
  s.on(({ f, vars }) => {
    P.setDoor(door, vars.door!);
    P.animate(fire, f, 1);
    P.animate(fireGlow, f, 0.8 + 0.2 * Math.sin(f * 1.7));
    P.animate(leakTop, f, vars.leak!);
    P.animate(leakCorner, f, vars.leak!);
    P.animate(leakSide, f, vars.side!);
    P.animate(tint, f, vars.tint!);
    P.animate(smokeL, f, vars.smokeL!);
    P.animate(smokeR, f, vars.smokeR!);
    chair.visible = vars.chair! > 0.5;
  });
});

defineShot("S38", {
  actors: {
    guest: {
      keys: [
        { f: 2785, pos: [0.2, 0.34, 0.37], face: 140, head: [112, 0, 0], legs: "sit", armL: "lap",
          armR: { ref: [0.555, 0.77], z: -0.2 }, handR: "grip", holdR: "burger", eyes: [0.4, 0], brows: [-0.2, -0.3] },
        { f: 2958, to: 2965, pos: [0.2, 0.468, 0.37] },
        { f: 2982, to: 2985, armR: "chest" },
        { f: 2986, to: 2990, head: [100, 0, 0] },
        { f: 2998, to: 2999, armR: "chin", head: [100, 8, 0] },
        { f: 3007, to: 3008, armR: "chest", head: [108, 0, 0] },
        { f: 3112, to: 3113, armR: "chin", head: [104, 8, 0] },
        { f: 3121, to: 3122, armR: "chest", head: [108, 0, 0] },
      ],
    },
    host: {
      track: { k: 1.05, oy: 0.06, ox: -0.1 },
      keys: [
        { f: 2785, show: true, face: -50, head: [-55, 0, 0], legs: "sit", armL: "lap", armR: "lap", eyes: [-0.5, 0], lids: 0.05, brows: [0.6, 0.7], mouth: -0.6,
          open: 0, teeth: 0, lean: 0, sway: 0, step: 0, handR: "open", handL: "open", holdR: null },
        { f: 2788, to: 2790, open: 0.45, lean: 5 },
        { f: 2806, to: 2808, open: 0, lean: 0, lids: 0.55, eyes: [-0.3, -0.6] },
        { f: 2814, to: 2814, lids: 0.05, eyes: [-0.5, 0], head: [-55, 3, 0] },
        { f: 2832, to: 2834, armR: { at: [0.715, 0.47] }, handR: "grip", holdR: "napkin", lids: 0.5, eyes: [-0.3, -0.5] },
        { f: 2839, to: 2839, lids: 0.05, eyes: [-0.5, 0] },
        { f: 2843, to: 2844, armR: { at: [0.72, 0.455] } },
        { f: 2847, to: 2848, armR: { at: [0.71, 0.475] } },
        { f: 2851, to: 2852, armR: { at: [0.72, 0.46] } },
        { f: 2855, to: 2856, armR: { at: [0.712, 0.475] } },
        { f: 2857, to: 2859, lids: 0.6 },
        { f: 2862, to: 2864, lids: 0.5, eyes: [-0.3, -0.6], armR: { at: [0.72, 0.46] } },
        { f: 2868, to: 2869, armR: { at: [0.71, 0.475] } },
        { f: 2872, to: 2873, armR: { at: [0.72, 0.46] } },
        { f: 2875, to: 2876, lids: 0.05, eyes: [-0.5, 0], head: [-55, 5, 0] },
        { f: 2878, to: 2879, armR: { at: [0.712, 0.475] } },
        { f: 2881, to: 2882, lids: 0.5, eyes: [-0.3, -0.6], head: [-55, 1, 0] },
        { f: 2884, to: 2885, armR: { at: [0.72, 0.46] } },
        { f: 2887, to: 2887, lids: 0.05, eyes: [-0.5, 0] },
        { f: 2890, to: 2891, armR: "lap" },
        { f: 2892, to: 2892, holdR: null, handR: "open", brows: [0.9, 0.5], open: 0.3 },
        { f: 2899, to: 2899, open: 0, mouth: -0.3 },
        { f: 2902, to: 2903, teeth: 1, mouth: -0.5, head: [-55, -3, 0] },
        { f: 2910, head: [-55, 2, 0] }, { f: 2916, head: [-55, -4, 0] }, { f: 2922, head: [-55, 2, 0] }, { f: 2928, head: [-55, -4, 0] },
        { f: 2936, to: 2937, teeth: 0, open: 0.2, head: [-55, -5, 0], brows: [0.5, 0.9] },
        { f: 2942, to: 2942, open: 0, mouth: -0.8 },
        { f: 2950, to: 2950, lids: 0.55 }, { f: 2953, to: 2953, lids: 0.05 },
        { f: 2956, to: 2957, head: [-50, 14, 0], mouth: 0.9, teeth: 1, brows: [0.9, 0] },
        { f: 2958, to: 2965, lean: 38, head: [-55, 0, 0], armR: { at: [0.94, 0.95] }, handR: "flat" },
        { f: 2966, to: 2966, eyes: [-0.3, -0.6], teeth: 0, mouth: 0 },
        { f: 2968, to: 2972, lean: 0, legs: "stand", eyes: [-0.5, 0], open: 0.4, armR: "down", armL: "down", handR: "open" },
        { f: 2974, to: 2975, open: 0, brows: [0.8, 0.2], face: -45, head: [-55, 0, 0] },
        { f: 2980, to: 2981, mouth: 0.6 },
        { f: 2988, to: 2989, face: 0, head: [-8, 0, 4], eyes: [-0.8, 0], mouth: 0.9, sway: 8, armL: "back" },
        { f: 2990, to: 2991, mouth: -0.6, brows: [0.6, 0.9] },
        { f: 2992, to: 2992, pos: "track" },
        { f: 2991, to: 2995, face: 150, head: [150, 0, 0], sway: 0, legs: "walk", step: 1, armL: "down" },
        { f: 2993, to: 2996, pos: [0.75, 0.33, 0.235] },
        { f: 2997, to: 3000, pos: [0.9, 0.34, 0.21], step: 3 },
        { f: 3001, show: false },
        // back out of the kitchen
        { f: 3030, show: true, pos: [0.9, 0.32, 0.215], face: -60, head: [-50, 0, 0], legs: "stand", eyes: [-0.4, 0], lids: 0, brows: [0.8, 0.3], mouth: -0.3 },
        { f: 3031, to: 3035, pos: [0.655, 0.305, 0.245], face: 0, head: [-10, 0, 0] },
        { f: 3036, to: 3039, open: 0.5 },
        { f: 3040, to: 3042, pos: [0.63, 0.33, 0.29], lids: 1, open: 1, brows: [0.3, 0.3], armR: { at: [0.66, 0.74] }, legs: "walk", step: 5 },
        { f: 3044, to: 3046, pos: [0.74, 0.31, 0.3], armR: { at: [0.7, 0.56] }, armL: { at: [0.84, 0.52] }, handL: "fist", handR: "fist", legs: "stand" },
        { f: 3046, to: 3051, armL: { at: [0.945, 0.17], z: 0.05 }, head: [-15, 8, 0] },
        { f: 3049, to: 3049, pos: "track" },
        { f: 3052, to: 3053, armR: { at: [0.655, 0.3], z: 0.05 } },
        { f: 3054, to: 3056, armR: { at: [0.47, 0.1], z: 0 }, armL: { at: [0.985, 0.14], z: 0 }, head: [-10, 28, 0], face: -5 },
        { f: 3054, to: 3056, pos: [0.74, 0.26, 0.3] },
        { f: 3058, sway: 3 }, { f: 3061, sway: -2 },
        { f: 3064, to: 3067, armR: { at: [0.4, 0.4], z: 0 }, armL: { at: [1.06, 0.38], z: 0 }, sway: 0 },
        { f: 3068, to: 3071, armR: { at: [0.5, 0.74] }, armL: { at: [0.93, 0.74] }, handL: "open", handR: "open" },
        { f: 3072, to: 3075, pos: [0.745, 0.33, 0.3], head: [-30, 0, 0], face: -25, open: 0, teeth: 1, mouth: 0.8, armR: { at: [0.63, 0.74] }, armL: { at: [0.82, 0.73] } },
        { f: 3076, to: 3078, pos: "track", armR: { at: [0.63, 0.63] }, armL: { at: [0.81, 0.6] }, teeth: 0 },
        { f: 3079, to: 3080, lids: 0.05, eyes: [-0.5, 0], brows: [0.7, 0.3], face: -40, head: [-52, 0, 0] },
        { f: 3082, to: 3083, armR: { at: [0.64, 0.61] }, armL: { at: [0.8, 0.62] } },
        { f: 3085, to: 3086, armR: { at: [0.63, 0.63] }, armL: { at: [0.81, 0.6] } },
        { f: 3088, to: 3089, lean: 16, armR: { at: [0.61, 0.79] }, armL: { at: [0.83, 0.76] }, handL: "flat", handR: "flat" },
        { f: 3090, to: 3091, sway: 10, armR: { at: [0.54, 0.8] } },
        { f: 3092, to: 3094, lean: 0, sway: 0, armR: "down", armL: "down", handL: "open", handR: "open", brows: [0.8, 0.2], mouth: 0.2 },
        { f: 3106, to: 3106, mouth: 0.6 },
        { f: 3128, to: 3128, mouth: 0.7 },
        { f: 3132, to: 3132, eyes: [0.5, 0] }, { f: 3134, to: 3134, eyes: [-0.5, 0] },
        { f: 3136, to: 3137, open: 0.3 },
        { f: 3138, to: 3139, open: 0, teeth: 1, mouth: 1 },
      ],
      blinks: [2859, 2820, 3100],
    },
  },
  vars: [
    { f: 2785, door: 0, leak: 0, side: 0, tint: 0, smokeL: 0, smokeR: 0, chair: 0 },
    { f: 2801, to: 2812, smokeL: 0.4 },
    { f: 2822, to: 2832, smokeR: 0.35 },
    { f: 2970, to: 2970, chair: 1 },
    { f: 2990, to: 2992, door: 42, smokeL: 0.6 },
    { f: 3001, to: 3003, door: 0 },
    { f: 3004, to: 3008, smokeL: 0.4 },
    { f: 3028, to: 3034, door: 78 },
    { f: 3032, to: 3034, tint: 1 },
    { f: 3040, to: 3041, tint: 0 },
    { f: 3043, to: 3049, door: 0 },
    { f: 3052, to: 3052, leak: 1 },
  ],
});

// S39 (stage K23, defined in dining_a): the guest puts the burger down, pulls the napkin from his collar and rises.
defineShot("S39", {
  actors: {
    guest: {
      keys: [
        { f: 3146, pos: [0.44, 0.22, 0.47], face: 25, head: [45, -12, 0], legs: "sit", bib: true, lean: 0, open: 0, teeth: 0,
          eyes: [0.2, -0.7], lids: 0.6, brows: [0, 0], mouth: -0.2,
          armR: { at: [0.41, 0.74], z: 0.1 }, armL: { at: [0.53, 0.74], z: 0.1 }, handR: "grip", handL: "grip", holdR: "burger", holdL: null },
        { f: 3148, to: 3151, armR: { at: [0.41, 0.97], z: 0.1 }, armL: { at: [0.56, 0.99], z: 0.1 } },
        { f: 3151, to: 3151, holdR: null, handR: "open", handL: "open" },
        { f: 3152, to: 3155, armL: { at: [0.62, 0.72], z: 0.12 } },
        { f: 3156, to: 3157, armL: { at: [0.64, 0.68], z: 0.12 } },
        { f: 3158, to: 3159, head: [45, 0, 0], lids: 0.85, open: 0.4 },
        { f: 3160, to: 3161, lids: 1, open: 0, armR: { at: [0.47, 0.62], z: 0.1 }, armL: { at: [0.53, 0.6], z: 0.1 }, handL: "grip", handR: "fist" },
        { f: 3162, to: 3163, bib: false, holdL: "napkin", armL: { at: [0.64, 0.62], z: 0.12 }, armR: { at: [0.46, 0.72], z: 0.1 }, lids: 0.6, head: [45, -10, 0] },
        { f: 3176, to: 3177, head: [45, 0, 0], armR: { at: [0.44, 0.97], z: 0.1 }, armL: { at: [0.56, 0.7], z: 0.12 } },
        { f: 3178, to: 3181, pos: [0.52, 0.17, 0.55], legs: "stand", lean: 22, armL: { at: [0.73, 0.72], z: 0.12 }, open: 0.3, lids: 0.5 },
        { f: 3182, to: 3183, pos: [0.555, 0.1, 0.58], lean: 12, armL: { at: [0.8, 0.93], z: 0.12 }, handL: "flat", open: 0, eyes: [0.8, 0], lids: 0.3 },
        { f: 3182, to: 3182, holdL: null },
        { f: 3184, to: 3184, pos: [0.575, 0.1, 0.62], brows: [0.6, 0], open: 0.3, armL: { at: [0.92, 1.0], z: 0.12 } },
      ],
    },
  },
});

// S40 (stage K22, defined in dining_a): the guest stands and points at the glowing door; the host looks back at it.
defineShot("S40", {
  actors: {
    guest: {
      keys: [
        { f: 3185, pos: [0.4, 0.64, 0.34], face: 150, head: [100, 0, 0], lean: 30, legs: "stand", armL: "down", armR: "down", handR: "open",
          eyes: [0.6, 0.2], lids: 0.1, brows: [0.3, 0], open: 0 },
        { f: 3192, to: 3198, pos: [0.33, 0.17, 0.38], lean: 0, open: 0.3 },
        { f: 3199, to: 3200, open: 0, head: [95, 0, 0] },
        { f: 3213, to: 3215, armR: { at: [0.57, 0.49], z: -0.5 }, handR: "point" },
        { f: 3256, to: 3258, armR: { at: [0.5, 0.82], z: -0.1 }, handR: "open" },
      ],
    },
    host: {
      keys: [
        { f: 3185, face: -45, head: [-55, 0, 0], legs: "stand", armL: "down", armR: "down", handL: "open", handR: "open",
          eyes: [-0.6, 0.1], lids: 0.2, brows: [0.2, 0], mouth: 0.6, teeth: 0, open: 0 },
        { f: 3203, to: 3203, mouth: 0 },
        { f: 3221, to: 3221, lids: 0, brows: [0.6, 0.3] },
        { f: 3223, to: 3226, head: [-130, 0, 0] },
        { f: 3224, to: 3225, armR: { at: [0.69, 0.86], z: 0.25 }, handR: "grip" },
        { f: 3227, to: 3229, armL: { at: [0.79, 0.87], z: 0.25 }, handL: "grip" },
        { f: 3241, to: 3242, head: [-55, 0, 0], lids: 0.5 },
        { f: 3243, to: 3243, lids: 1 },
        { f: 3245, to: 3245, lids: 0.1, brows: [0.8, 0.1] },
        { f: 3257, to: 3258, mouth: 1, teeth: 1, open: 0.3 },
        { f: 3263, to: 3263, lids: 1, open: 0 },
        { f: 3266, to: 3266, lids: 0.3 },
      ],
      blinks: [3199],
    },
  },
  props: [
    { make: () => P.glow(1, 0.035, FIRE_PINK, 0.95), keys: [{ f: 3185, at: [0.625, 0.06], depth: 5.0, scale: 0.75, show: true }, { f: 3217, to: 3217, show: false }] },
    { make: () => P.glow(0.1, 0.14, 0xe0303a, 0.95), keys: [{ f: 3185, at: [0.765, 0.11], depth: 4.98, scale: 0.75, show: true }, { f: 3217, to: 3217, show: false }] },
  ],
});

// K30: close-up of the guest against the wall (S41-S45 punch in step by step, S47 is a little wider).
defineStage("K30", (s) => {
  s.cam({ fov: 18, bg: P.C.wallBlue });
  s.card(P.C.wallBlue, 4);
  // pale frame with a purple panel at the right edge
  s.fit((w, h) => G(P.block(w, h, 0.04, P.C.trim)), [0.725, 0.1, 1.4, 1.6], 3.6);
  s.fit((w, h) => G(P.block(w, h, 0.04, 0x8f7fc0)), [0.785, 0.2, 1.4, 1.6], 3.55);
  // green oval frame with pink flowers, bottom left
  s.fit((w, h) => P.ovalFrame(w, h, { fill: 0xe8a6d0 }), [0.01, 0.62, 0.2, 1.25], 3.2);
});

const GLARE: [number, number] = [-0.7, -1], ROUND: [number, number] = [1, 0];
const HOME: [number, number, number] = [0.445, 0.53, 0.76];

defineShot("S41", {
  actors: {
    guest: {
      keys: [
        { f: 3272, rpos: HOME, face: 45, head: [48, 0, 0], eyes: [0.65, 0], lids: 0.45, brows: [0.2, 0], mouth: -0.6, teeth: 0, open: 0 },
        { f: 3276, to: 3277, brows: [-0.1, -0.35], open: 0.25 },
        { f: 3284, to: 3285, open: 0.05 },
        { f: 3296, to: 3299, brows: [-0.2, -0.65] },
        { f: 3300, to: 3303, head: [54, 6, 0], open: 0 },
        { f: 3304, to: 3305, brows: [0.35, -0.6] },
        { f: 3308, to: 3309, head: [48, 0, 0] },
        { f: 3312, to: 3312, mouth: -0.9 },
        { f: 3314, to: 3317, head: [54, 6, 0] },
        { f: 3320, to: 3323, brows: GLARE, lids: 0.25, head: [48, -4, 0] },
        { f: 3332, to: 3333, teeth: 1 },
        { f: 3336, to: 3339, head: [56, -8, 0] },
      ],
    },
  },
});

defineShot("S42", {
  actors: {
    guest: {
      keys: [
        { f: 3344, rpos: HOME, face: 45, head: [52, -5, 0], eyes: [0.7, 0], lids: 0.1, brows: GLARE, mouth: -0.7, teeth: 0, open: 0 },
        { f: 3350, to: 3350, teeth: 1 },
        { f: 3352, to: 3353, teeth: 0, head: [52, -1, 0] },
        { f: 3354, to: 3355, teeth: 1, head: [52, -5, 0] },
        { f: 3358, to: 3359, teeth: 0, head: [52, -8, 0] },
        { f: 3360, to: 3360, mouth: -0.9 },
        { f: 3366, to: 3366, teeth: 1 },
        { f: 3368, to: 3369, teeth: 0, head: [52, -2, 0] },
      ],
    },
  },
});

defineShot("S43", {
  actors: {
    guest: {
      keys: [
        { f: 3375, rpos: HOME, face: 45, head: [52, -3, 0], eyes: [0.7, 0], lids: 0.1, brows: GLARE, mouth: -0.6, teeth: 0, open: 0 },
        { f: 3376, to: 3376, brows: ROUND, lids: 0, eyes: [0.5, 0] },
        { f: 3378, to: 3378, teeth: 1 },
        { f: 3380, to: 3381, teeth: 0, head: [52, 1, 0] },
        { f: 3382, to: 3382, teeth: 1, head: [52, -2, 0] },
        { f: 3386, to: 3386, teeth: 0 },
        { f: 3390, to: 3390, mouth: -0.9 },
        { f: 3396, to: 3396, teeth: 1 },
        { f: 3398, to: 3399, teeth: 0, head: [52, 3, 0] },
        { f: 3402, to: 3404, head: [52, -1, 0] },
      ],
    },
  },
});

defineShot("S44", {
  actors: {
    guest: {
      keys: [
        { f: 3409, rpos: HOME, face: 45, head: [52, -1, 0], eyes: [0.5, 0], lids: 0, brows: ROUND, mouth: -0.7, teeth: 0, open: 0 },
        { f: 3410, to: 3410, teeth: 1 },
        { f: 3411, to: 3411, brows: GLARE, lids: 0.3, eyes: [0.7, 0] },
        { f: 3414, to: 3414, teeth: 0 },
        { f: 3416, to: 3416, teeth: 1 },
        { f: 3418, to: 3418, teeth: 0, mouth: -0.9 },
        { f: 3420, to: 3421, head: [52, 3, 0] },
        { f: 3424, to: 3425, head: [52, -1, 0] },
        { f: 3428, to: 3428, teeth: 1 },
        { f: 3430, to: 3431, teeth: 0, head: [52, -5, 0] },
        { f: 3434, to: 3434, teeth: 1 },
        { f: 3436, to: 3437, teeth: 0, head: [58, -3, 0] },
        { f: 3438, to: 3439, head: [52, -2, 0] },
        { f: 3444, to: 3444, teeth: 1 },
      ],
    },
  },
});

defineShot("S45", {
  actors: {
    guest: {
      keys: [
        { f: 3446, rpos: HOME, face: 45, head: [52, -2, 0], eyes: [0.75, 0], lids: 0.05, brows: GLARE, mouth: -0.7, teeth: 0, open: 0 },
        { f: 3454, to: 3454, teeth: 1 }, { f: 3457, to: 3457, teeth: 0 },
        { f: 3466, to: 3466, teeth: 1 }, { f: 3469, to: 3469, teeth: 0 },
        { f: 3472, to: 3478, rpos: [0.44, 0.49, 0.79], head: [52, 7, 0], open: 0.3 },
        { f: 3480, to: 3482, open: 0 },
        { f: 3490, to: 3490, teeth: 1 }, { f: 3493, to: 3493, teeth: 0 },
        { f: 3501, to: 3503, lids: 0.5 },
        { f: 3511, to: 3511, teeth: 1 },
      ],
    },
  },
});

defineShot("S47", {
  actors: {
    guest: {
      track: { k: 1.05, ox: -0.12 },
      keys: [
        { f: 3534, face: 45, head: [48, 0, 0], eyes: [0.65, 0], lids: 0.35, brows: [0, 0], mouth: -0.15, teeth: 0, open: 0 },
        { f: 3557, to: 3557, lids: 0.5, eyes: [0.5, -0.7], brows: [0.2, 0.6] },
        { f: 3563, to: 3563, eyes: [0.65, 0] },
        { f: 3564, to: 3567, head: [48, 6, 0], lids: 0, brows: [0.7, 0.7] },
        { f: 3579, to: 3579, teeth: 0.6 },
      ],
      blinks: [3553],
    },
  },
});

// K32 / K33: close-up of the host; fire light leaks down the door edge at the left of frame.
function hostDoorEdge(s: Parameters<Parameters<typeof defineStage>[1]>[0]) {
  s.cam({ fov: 18, bg: 0x6f7fd8 });
  s.card(0x6f7fd8, 4);
  // door jamb and the lit gap
  s.card(0xb07ac8, 3.95, [-0.2, -1, 0.245, 2]);
  s.card(0xc06a9a, 3.9, [-0.2, 0.65, 0.065, 2]);
  const wash = s.fit((w, h) => P.glow(w, h, 0xe04a6a, 0.45), [0.04, -0.5, 0.2, 1.5], 3.85);
  const core = s.fit((w, h) => P.glow(w, h, 0xff4a2a, 1), [0.09, -0.5, 0.145, 1.5], 3.8);
  s.fit((w, h) => P.picture(w, h, { art: "red" }), [0.855, -0.2, 1.1, 0.62], 3.95);
  s.defaults.glow = 1;
  s.on(({ f, vars }) => {
    P.animate(core, f, vars.glow! * (0.93 + 0.07 * Math.sin(f * 0.9)));
    P.animate(wash, f, vars.glow!);
  });
}
defineStage("K32", hostDoorEdge);
defineStage("K33", hostDoorEdge);

defineShot("S46", {
  actors: {
    host: {
      keys: [
        { f: 3513, pos: [0.52, 0.56, 0.76], face: -45, head: [-50, 0, 0], eyes: [-0.6, 0], lids: 0.5, brows: [0, 0], mouth: -0.3, teeth: 0, open: 0 },
        { f: 3518, to: 3522, pos: [0.535, 0.51, 0.76], head: [-50, 8, 0], mouth: 0.8 },
        { f: 3519, to: 3519, lids: 0, brows: [0.8, 0], eyes: [-0.3, 0], open: 0.15 },
        { f: 3528, to: 3528, open: 0, teeth: 1, mouth: 1 },
      ],
    },
  },
});

defineShot("S48", {
  actors: {
    host: {
      keys: [
        { f: 3583, pos: [0.535, 0.525, 0.76], face: -45, head: [-50, 0, 0], eyes: [-0.3, 0], lids: 0, brows: [0, 0], mouth: -0.5, teeth: 0, open: 0 },
        { f: 3594, to: 3594, lids: 1 },
        { f: 3596, to: 3596, lids: 0.55 },
        { f: 3598, to: 3598, lids: 0.3, eyes: [0.3, -0.7], brows: [0.1, 0.8] },
        { f: 3611, to: 3612, lids: 0.55, eyes: [-0.2, 0] },
        { f: 3613, to: 3613, lids: 1, open: 0.35 },
        { f: 3615, to: 3616, lids: 0.5, eyes: [-0.6, 0], head: [-50, 6, 0], pos: [0.535, 0.515, 0.76], open: 0.25, brows: [0, 0] },
        { f: 3617, to: 3617, open: 0, mouth: -0.2 },
      ],
    },
  },
});
