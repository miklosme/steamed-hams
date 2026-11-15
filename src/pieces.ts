// Set pieces, hand props and effects, all built from primitives. Sizes are metres.
// Unless noted, a piece's origin is the bottom centre of its front face and it faces +Z.
import * as THREE from "three";
import { mat } from "./rig";

export const C = {
  wallBlue: 0x8f94d8, wallBlueDark: 0x7d83cc, wallGreen: 0x8fb9a8, wallLilac: 0xb3a2d8, houseLilac: 0xb7b3e0,
  door: 0x7a6aa0, doorPanel: 0x6c5d92, doorFrame: 0xa3acea, trim: 0xa8b2ee,
  carpet: 0x2f7f86, tile: 0xa7a0cf, tileLine: 0x5a5480,
  white: 0xf3f1ea, cloth: 0xf6f3ec, wood: 0x7a2f2a, woodDark: 0x5e231f, brass: 0xd9b23c,
  green: 0x3f8a3a, greenDark: 0x2f6e2c, steel: 0xb9bcc8, glass: 0xcfe4f2,
  sky: 0x8fc4ea, grass: 0x6fbf6a, road: 0x8a8a92, roofRed: 0xd9532c, roof: 0x5d5486,
  smoke: 0x6f6f78, fire: 0xff7a1a, fireHot: 0xffd24a,
};

type G = THREE.Group;
const grp = (...kids: THREE.Object3D[]) => { const g = new THREE.Group(); if (kids.length) g.add(...kids); return g; };

/** Box with its origin at the bottom centre of the front face. */
export function block(w: number, h: number, d: number, color: number, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y + h / 2, z - d / 2);
  return m;
}
export function cyl(rTop: number, rBot: number, h: number, color: number, x = 0, y = 0, z = 0, seg = 24) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat(color));
  m.position.set(x, y + h / 2, z);
  return m;
}
export function orb(rx: number, ry: number, rz: number, color: number, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), mat(color));
  m.scale.set(rx, ry, rz);
  m.position.set(x, y, z);
  return m;
}
/** Flat upright card, origin at its bottom centre. */
export function card(w: number, h: number, material: THREE.Material | number) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), typeof material === "number" ? mat(material, { side: THREE.DoubleSide }) : material);
  m.position.y = h / 2;
  return grp(m);
}

// ---------------------------------------------------------------- painted cards

function paint(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  draw(cv.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide });
}
const hex = (n: number) => `#${n.toString(16).padStart(6, "0")}`;
function cloud(c: CanvasRenderingContext2D, x: number, y: number, s: number) {
  c.fillStyle = "#f4f4f6";
  for (const [dx, dy, r] of [[0, 0, 1], [0.9, 0.15, 0.8], [-0.9, 0.2, 0.7], [0.3, -0.4, 0.7]] as const) {
    c.beginPath(); c.ellipse(x + dx * s, y + dy * s, r * s, r * s * 0.55, 0, 0, 7); c.fill();
  }
}
function houseShape(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, wall: string, roof: string) {
  c.fillStyle = wall; c.fillRect(x, y - h, w, h);
  c.fillStyle = roof; c.beginPath(); c.moveTo(x - w * 0.08, y - h); c.lineTo(x + w / 2, y - h * 1.55); c.lineTo(x + w * 1.08, y - h); c.fill();
  c.fillStyle = "#e9e6c8";
  c.fillRect(x + w * 0.15, y - h * 0.75, w * 0.22, h * 0.3); c.fillRect(x + w * 0.62, y - h * 0.75, w * 0.22, h * 0.3);
}
function treeShape(c: CanvasRenderingContext2D, x: number, y: number, s: number) {
  c.fillStyle = "#5a4634"; c.fillRect(x - s * 0.08, y - s * 0.7, s * 0.16, s * 0.7);
  c.fillStyle = "#3e8f3c"; c.beginPath(); c.ellipse(x, y - s, s * 0.55, s * 0.5, 0, 0, 7); c.fill();
}

export type Scene2D = "street" | "suburb" | "sky" | "dusk";
const sceneMats = new Map<string, THREE.Material>();
/** Painted backdrop: `street` = road, lawn and a red-roofed restaurant with a sign on a pole; `suburb` = houses and trees. */
export function sceneMat(kind: Scene2D): THREE.Material {
  let m = sceneMats.get(kind);
  if (m) return m;
  m = paint(1024, 576, (c, w, h) => {
    const sky = c.createLinearGradient(0, 0, 0, h * 0.6);
    if (kind === "dusk") { sky.addColorStop(0, "#4a3f86"); sky.addColorStop(1, "#b98ac0"); }
    else { sky.addColorStop(0, "#7fb6e6"); sky.addColorStop(1, "#b9dcf2"); }
    c.fillStyle = sky; c.fillRect(0, 0, w, h);
    if (kind !== "dusk") { cloud(c, w * 0.2, h * 0.14, 46); cloud(c, w * 0.62, h * 0.09, 38); cloud(c, w * 0.88, h * 0.22, 30); }
    if (kind === "sky") return;
    c.fillStyle = kind === "dusk" ? "#3d6a52" : "#4f9a4c";
    c.beginPath(); c.moveTo(0, h * 0.5);
    for (let x = 0; x <= w; x += 40) c.lineTo(x, h * (0.47 + 0.03 * Math.sin(x * 0.02)));
    c.lineTo(w, h); c.lineTo(0, h); c.fill();
    c.fillStyle = kind === "dusk" ? "#4f8a62" : hex(C.grass); c.fillRect(0, h * 0.56, w, h);
    if (kind === "street") {
      c.fillStyle = hex(C.road); c.fillRect(0, h * 0.66, w, h * 0.13);
      c.fillStyle = "#c9c9cf"; c.fillRect(0, h * 0.8, w, h * 0.05);
      // restaurant with a sign on a pole
      c.fillStyle = "#f0d9b0"; c.fillRect(w * 0.5, h * 0.47, w * 0.26, h * 0.17);
      c.fillStyle = hex(C.roofRed); c.beginPath(); c.moveTo(w * 0.47, h * 0.47); c.lineTo(w * 0.52, h * 0.37); c.lineTo(w * 0.74, h * 0.37); c.lineTo(w * 0.79, h * 0.47); c.fill();
      c.fillStyle = "#7fc8d8"; c.fillRect(w * 0.53, h * 0.52, w * 0.07, h * 0.08); c.fillRect(w * 0.65, h * 0.52, w * 0.07, h * 0.08);
      c.fillStyle = "#6a5a50"; c.fillRect(w * 0.775, h * 0.2, w * 0.008, h * 0.45);
      c.fillStyle = "#c8742c"; c.beginPath(); c.ellipse(w * 0.78, h * 0.2, w * 0.045, h * 0.05, 0, 0, 7); c.fill();
      c.fillStyle = "#8f9ad8"; c.fillRect(w * 0.3, h * 0.63, w * 0.1, h * 0.04);
      treeShape(c, w * 0.12, h * 0.6, 70); treeShape(c, w * 0.93, h * 0.6, 60);
    } else {
      houseShape(c, w * 0.05, h * 0.62, w * 0.2, h * 0.2, "#e8a878", "#c8643c");
      houseShape(c, w * 0.42, h * 0.6, w * 0.22, h * 0.24, "#d9c98a", "#8a7a3c");
      houseShape(c, w * 0.74, h * 0.62, w * 0.2, h * 0.2, "#c9d0a0", "#7a6a4a");
      treeShape(c, w * 0.32, h * 0.62, 90); treeShape(c, w * 0.68, h * 0.62, 70);
      c.fillStyle = "#c9c9cf"; c.fillRect(0, h * 0.72, w, h * 0.05);
      c.fillStyle = hex(C.road); c.fillRect(0, h * 0.77, w, h * 0.3);
    }
  });
  sceneMats.set(kind, m);
  return m;
}
/** A painted backdrop as an upright card. */
export function backdrop(kind: Scene2D, w: number, h: number) { return card(w, h, sceneMat(kind)); }

export type Art = "fruit" | "landscape" | "red" | "boat" | "portrait";
function artMat(kind: Art) {
  return paint(256, 192, (c, w, h) => {
    if (kind === "fruit") {
      c.fillStyle = "#58b7c8"; c.fillRect(0, 0, w, h); c.fillStyle = "#3f8f5a"; c.fillRect(0, h * 0.62, w, h);
      for (const [x, col] of [[0.3, "#e8943a"], [0.5, "#d94a3a"], [0.68, "#e8d24a"]] as const) { c.fillStyle = col; c.beginPath(); c.arc(w * x, h * 0.55, h * 0.16, 0, 7); c.fill(); }
    } else if (kind === "landscape" || kind === "boat") {
      c.fillStyle = "#c7a0d0"; c.fillRect(0, 0, w, h); c.fillStyle = "#8a6fb0";
      c.beginPath(); c.moveTo(0, h * 0.6); c.lineTo(w * 0.3, h * 0.25); c.lineTo(w * 0.55, h * 0.55); c.lineTo(w * 0.8, h * 0.3); c.lineTo(w, h * 0.6); c.lineTo(w, h); c.lineTo(0, h); c.fill();
      c.fillStyle = "#5fb0c8"; c.fillRect(0, h * 0.68, w, h);
    } else if (kind === "red") {
      c.fillStyle = "#c8443a"; c.fillRect(0, 0, w, h); c.fillStyle = "#e8a04a"; c.fillRect(0, 0, w, h * 0.3);
      c.strokeStyle = "#7a5aa0"; c.lineWidth = 12; c.beginPath(); c.moveTo(w * 0.3, h); c.lineTo(w * 0.5, h * 0.1); c.moveTo(w * 0.6, h); c.lineTo(w * 0.75, 0); c.stroke();
    } else {
      // head-and-shoulders bust on a plain ground
      c.fillStyle = "#9a98a8"; c.fillRect(0, 0, w, h);
      c.fillStyle = "#27418f"; c.beginPath(); c.ellipse(w * 0.45, h * 1.05, w * 0.36, h * 0.42, 0, 0, 7); c.fill();
      c.fillStyle = "#d9a27c"; c.beginPath(); c.ellipse(w * 0.45, h * 0.4, w * 0.15, h * 0.26, 0, 0, 7); c.fill();
    }
  });
}

// ---------------------------------------------------------------- architecture

/**
 * Panelled door in its frame. `hinge` is the side it turns on; setDoor(door, deg) swings the leaf
 * (positive opens toward the viewer).
 */
export function door(w: number, h: number, o: { color?: number; frame?: number | false; hinge?: "left" | "right"; knob?: boolean } = {}): G {
  const color = o.color ?? C.door, hingeSide = o.hinge === "right" ? 1 : -1;
  const g = grp();
  const pivot = grp();
  pivot.position.set(hingeSide * w / 2, 0, 0);
  const leaf = block(w, h, 0.045, color, -hingeSide * w / 2, 0, 0);
  pivot.add(leaf);
  for (const [py, ph] of [[0.1, 0.34], [0.5, 0.42]] as const) {
    const p = block(w * 0.62, h * ph, 0.012, C.doorPanel, -hingeSide * w / 2, h * py, 0.012);
    pivot.add(p);
  }
  if (o.knob !== false) pivot.add(orb(0.035, 0.035, 0.035, C.brass, -hingeSide * (w - 0.08), h * 0.46, 0.05));
  g.add(pivot);
  if (o.frame !== false) {
    const fc = o.frame ?? C.doorFrame, t = 0.09;
    g.add(block(t, h + t, 0.08, fc, -w / 2 - t / 2, 0, 0.02), block(t, h + t, 0.08, fc, w / 2 + t / 2, 0, 0.02), block(w + 2 * t, t, 0.08, fc, 0, h, 0.02));
  }
  g.userData.pivot = pivot;
  g.userData.hinge = hingeSide;
  return g;
}
export function setDoor(d: THREE.Object3D, deg: number) {
  (d.userData.pivot as G).rotation.y = THREE.MathUtils.degToRad(deg) * (d.userData.hinge as number);
}

/** Sash window with a painted view behind it. setSash(win, 0..1) raises the lower sash. */
export function windowPiece(w: number, h: number, o: { frame?: number; view?: Scene2D | number; viewScale?: number } = {}): G {
  const fc = o.frame ?? C.trim, t = Math.min(w, h) * 0.07;
  const g = grp();
  const vs = o.viewScale ?? 1.6;
  const view = typeof o.view === "number" ? card(w * vs, h * vs, o.view) : backdrop(o.view ?? "street", w * vs, h * vs);
  view.position.set(0, -h * (vs - 1) / 2, -0.5);
  g.add(view);
  g.add(block(t, h, 0.07, fc, -w / 2, 0, 0.03), block(t, h, 0.07, fc, w / 2, 0, 0.03), block(w + t, t, 0.07, fc, 0, h - t / 2, 0.03), block(w + t * 2.4, t * 1.3, 0.14, fc, 0, -t * 0.6, 0.08));
  const upper = grp(block(w, t * 0.7, 0.03, fc, 0, h * 0.5, 0.0), block(t * 0.5, h * 0.5, 0.02, fc, 0, h * 0.5, 0));
  const sash = grp(block(w, t * 0.7, 0.04, fc, 0, 0, 0.02), block(w, t * 0.6, 0.04, fc, 0, h * 0.5 - t * 0.3, 0.02));
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(w, h * 0.5), mat(C.glass, { opacity: 0.18 }));
  pane.position.set(0, h * 0.25, 0);
  sash.add(pane);
  g.add(upper, sash);
  g.userData.sash = sash; g.userData.h = h;
  return g;
}
export function setSash(win: THREE.Object3D, open: number) {
  (win.userData.sash as G).position.y = open * (win.userData.h as number) * 0.46;
}

/** Framed picture. */
export function picture(w: number, h: number, o: { frame?: number; art?: Art | number } = {}): G {
  const t = Math.min(w, h) * 0.1;
  const art = new THREE.Mesh(new THREE.PlaneGeometry(w - t * 1.6, h - t * 1.6), typeof o.art === "number" ? mat(o.art) : artMat(o.art ?? "landscape"));
  art.position.set(0, h / 2, 0.012);
  return grp(block(w, h, 0.03, o.frame ?? C.green, 0, 0, 0.01), art);
}
/** Ornate oval frame (mirror or portrait). */
export function ovalFrame(w: number, h: number, o: { frame?: number; fill?: number } = {}): G {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.09, 10, 36), mat(o.frame ?? C.green));
  ring.scale.set(w, h, 0.25);
  ring.position.y = h / 2;
  const fill = orb(w * 0.46, h * 0.46, 0.01, o.fill ?? 0xe3a6d0, 0, h / 2, 0);
  return grp(ring, fill);
}

// ---------------------------------------------------------------- furniture (origin on the floor, centre)

export function table(o: { r?: number; h?: number } = {}): G {
  const r = o.r ?? 0.62, h = o.h ?? 0.76;
  const top = cyl(r, r, 0.03, C.cloth, 0, h - 0.03, 0, 36);
  const skirt = cyl(r, r * 1.06, h * 0.72, C.cloth, 0, h * 0.28 - 0.02, 0, 36);
  const leg = cyl(0.06, 0.1, h * 0.3, C.woodDark, 0, 0, 0);
  return grp(top, skirt, leg);
}
/** Wooden dining chair; the sitter faces +Z. */
export function chair(o: { color?: number } = {}): G {
  const col = o.color ?? C.wood, g = grp();
  g.add(block(0.44, 0.04, 0.42, col, 0, 0.44, 0.21));
  for (const [x, z] of [[-0.19, 0.19], [0.19, 0.19], [-0.19, -0.19], [0.19, -0.19]] as const) g.add(block(0.04, z < 0 ? 1.0 : 0.44, 0.04, col, x, 0, z + 0.02));
  g.add(block(0.42, 0.07, 0.03, col, 0, 0.92, -0.18), block(0.42, 0.06, 0.03, col, 0, 0.74, -0.18), block(0.42, 0.06, 0.03, col, 0, 0.58, -0.18));
  return g;
}
export function armchair(o: { color?: number } = {}): G {
  const col = o.color ?? C.green;
  return grp(block(0.8, 0.42, 0.75, col, 0, 0, 0.38), block(0.8, 0.6, 0.18, C.greenDark, 0, 0.42, -0.2), block(0.16, 0.24, 0.7, C.greenDark, -0.4, 0.42, 0.36), block(0.16, 0.24, 0.7, C.greenDark, 0.4, 0.42, 0.36));
}
/** Side table with a shaded lamp. */
export function lamp(o: { shade?: number } = {}): G {
  const g = grp(block(0.4, 0.04, 0.4, 0xa0506a, 0, 0.6, 0.2));
  for (const [x, z] of [[-0.17, 0.17], [0.17, 0.17], [-0.17, -0.17], [0.17, -0.17]] as const) g.add(block(0.03, 0.6, 0.03, 0xa0506a, x, 0, z + 0.015));
  g.add(cyl(0.02, 0.05, 0.25, 0xcfd8c0, 0, 0.64, 0), cyl(0.1, 0.2, 0.26, o.shade ?? 0xd8ecc4, 0, 0.86, 0));
  return g;
}
/** Kitchen range. setOvenDoor(oven, 0..1) drops the door open. */
export function oven(): G {
  const g = grp(block(0.78, 0.9, 0.66, C.white), block(0.78, 0.24, 0.06, C.white, 0, 0.9, -0.6));
  for (const x of [-0.24, -0.08, 0.08, 0.24]) g.add(cyl(0.03, 0.03, 0.02, 0x8a8a96, x, 1.02, -0.59).rotateX(Math.PI / 2));
  for (const [x, z] of [[-0.2, -0.18], [0.2, -0.18], [-0.2, -0.46], [0.2, -0.46]] as const) g.add(cyl(0.09, 0.09, 0.012, 0x4a4a55, x, 0.9, z));
  const pivot = grp();
  pivot.position.set(0, 0.16, 0.005);
  pivot.add(block(0.7, 0.56, 0.035, C.white, 0, 0, 0.035), block(0.5, 0.28, 0.01, 0x5a6a7a, 0, 0.16, 0.042), block(0.56, 0.03, 0.03, C.steel, 0, 0.5, 0.07));
  g.add(pivot, block(0.74, 0.5, 0.01, 0x2a2a30, 0, 0.2, -0.02));
  g.userData.pivot = pivot;
  return g;
}
export function setOvenDoor(o: THREE.Object3D, open: number) { (o.userData.pivot as G).rotation.x = open * 1.45; }
/** Cupboard with door fronts. */
export function cabinet(w: number, h: number, d = 0.5, color: number = C.wallBlue): G {
  const g = grp(block(w, h, d, color));
  const n = Math.max(1, Math.round(w / 0.5));
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (i + 0.5) * (w / n);
    g.add(block(w / n - 0.06, h - 0.1, 0.02, C.trim, x, 0.05, 0.02), orb(0.02, 0.02, 0.02, C.steel, x + (w / n) * 0.3, h * 0.55, 0.05));
  }
  return g;
}

// ---------------------------------------------------------------- exterior

export function tree(h = 5): G {
  return grp(cyl(0.18, 0.28, h * 0.5, 0x6a5038), orb(h * 0.34, h * 0.3, h * 0.3, C.greenDark, 0, h * 0.7, 0), orb(h * 0.24, h * 0.22, h * 0.22, C.green, h * 0.18, h * 0.82, 0.3), orb(h * 0.22, h * 0.2, h * 0.2, C.green, -h * 0.2, h * 0.6, 0.3));
}
export function bush(r = 0.5): G {
  return grp(orb(r, r * 0.8, r * 0.8, C.greenDark, 0, r * 0.7, 0), orb(r * 0.6, r * 0.55, r * 0.6, C.green, r * 0.5, r * 0.5, 0.1));
}
/** Porch railing: top and bottom rail with turned balusters. */
export function balustrade(w: number, h = 0.9): G {
  const g = grp(block(w, 0.07, 0.1, C.white, 0, h - 0.07, 0.05), block(w, 0.05, 0.08, C.white, 0, 0.06, 0.04));
  const n = Math.max(2, Math.round(w / 0.2));
  for (let i = 0; i < n; i++) g.add(cyl(0.035, 0.05, h - 0.18, C.white, -w / 2 + (i + 0.5) * (w / n), 0.11, 0, 10));
  return g;
}
/** House window with shutters. setFire(win, f, amount) lights it from inside. */
export function shutterWindow(w: number, h: number, o: { shutter?: number; lit?: number } = {}): G {
  const g = grp(block(w, h, 0.02, o.lit ?? 0xe9e6c0, 0, 0, 0.0));
  const t = 0.05;
  g.add(block(w + 2 * t, t, 0.05, C.white, 0, h, 0.03), block(w + 2 * t, t, 0.05, C.white, 0, -t, 0.03), block(t, h, 0.05, C.white, -w / 2, 0, 0.03), block(t, h, 0.05, C.white, w / 2, 0, 0.03));
  g.add(block(t * 0.6, h, 0.04, C.white, 0, 0, 0.025), block(w, t * 0.6, 0.04, C.white, 0, h / 2, 0.025));
  g.add(block(w * 0.3, h, 0.04, o.shutter ?? 0x8a5a8a, -w * 0.68, 0, 0.03), block(w * 0.3, h, 0.04, o.shutter ?? 0x8a5a8a, w * 0.68, 0, 0.03));
  const fire = flames(w * 0.9, h * 0.8, 7);
  fire.position.set(0, 0.02, 0.012);
  g.add(fire);
  g.userData.fire = fire;
  animate(fire, 0, 0);
  return g;
}
export function setFire(win: THREE.Object3D, f: number, amount: number) { animate(win.userData.fire as G, f, amount); }

/** Two-storey house with porch and garage, about 12 m wide; origin at the ground under the front door. */
export function house(): G {
  const g = grp();
  const wall = C.houseLilac;
  g.add(block(7, 5.6, 6, wall, 0.5, 0, 0)); // main block
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 4.4, 2.2, 4, 1), mat(C.roof));
  roof.rotation.y = Math.PI / 4; roof.scale.set(1.1, 1, 1); roof.position.set(0.5, 6.7, -3);
  g.add(roof);
  g.add(block(4.4, 2.8, 5, wall, -5.2, 0, 0)); // garage
  const groof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 3.4, 1.4, 4, 1), mat(C.roof));
  groof.rotation.y = Math.PI / 4; groof.position.set(-5.2, 3.5, -2.5);
  g.add(groof, block(2.8, 2.1, 0.05, 0x9aa0c8, -5.2, 0, 0.03));
  // porch
  g.add(block(7.4, 0.35, 1.8, 0xd8d6e6, 0.5, 0, 1.8), block(7.6, 0.18, 2.0, C.roof, 0.5, 2.9, 1.9));
  for (const x of [-3, -1.2, 1.2, 4]) g.add(block(0.14, 2.6, 0.14, C.white, x, 0.35, 1.7));
  const r1 = balustrade(1.7); r1.position.set(-2.1, 0.35, 1.72);
  const r2 = balustrade(2.7); r2.position.set(2.6, 0.35, 1.72);
  g.add(r1, r2, block(1.6, 0.18, 0.5, 0xc8c6d6, 0, 0, 2.3));
  const d = door(0.95, 2.05, { frame: C.white });
  d.position.set(0, 0.35, 0.03);
  g.add(d);
  g.userData.door = d;
  const wins: G[] = [];
  for (const [x, y] of [[-2.1, 1.0], [2.5, 1.0], [-1.2, 3.6], [2.2, 3.6]] as const) {
    const w = shutterWindow(1.3, 1.4);
    w.position.set(x, y + 0.2, 0.02);
    g.add(w); wins.push(w);
  }
  g.userData.windows = wins;
  return g;
}

// ---------------------------------------------------------------- effects

/** Call a piece's per-frame animation (smoke, flames): amount 0..1. */
export function animate(obj: THREE.Object3D, f: number, amount = 1) { (obj.userData.update as ((f: number, a: number) => void) | undefined)?.(f, amount); }

/** Rising smoke column, origin at its base. */
export function smoke(w = 0.5, h = 2.2, n = 16, color: number = 0x8c8c96): G {
  const g = grp();
  const puffs: THREE.Mesh[] = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.5, depthWrite: false }));
    puffs.push(m); g.add(m);
  }
  g.userData.update = (f: number, amount: number) => {
    g.visible = amount > 0.01;
    puffs.forEach((m, i) => {
      const ph = (f * 0.012 + i / n) % 1;
      const wob = Math.sin(i * 2.4 + f * 0.05) * 0.35 + Math.sin(i * 5.1) * 0.3;
      m.position.set(wob * w * (0.3 + ph), ph * h, Math.cos(i * 3.3) * w * 0.3);
      m.scale.setScalar(w * (0.3 + ph * 0.75));
      (m.material as THREE.MeshLambertMaterial).opacity = 0.3 * amount * Math.min(1, ph * 6) * (1 - ph * ph);
    });
  };
  animate(g, 0, 1);
  return g;
}
/** Flickering flames, origin at the base centre. */
export function flames(w = 0.6, h = 0.5, n = 7): G {
  const g = grp();
  const cones: THREE.Mesh[] = [];
  for (let i = 0; i < n * 2; i++) {
    const hot = i >= n;
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 8), mat(hot ? C.fireHot : C.fire, { basic: true, opacity: 0.92 }));
    cones.push(m); g.add(m);
  }
  g.userData.update = (f: number, amount: number) => {
    g.visible = amount > 0.01;
    cones.forEach((m, i) => {
      const k = i % n, hot = i >= n;
      const fl = 0.7 + 0.3 * Math.sin(Math.floor(f / 2) * 2.1 + k * 1.7) + 0.15 * Math.sin(f * 1.3 + k);
      const ch = h * fl * amount * (hot ? 0.55 : 1) * (0.7 + 0.3 * Math.sin(k * 2.2));
      m.scale.set((w / n) * (hot ? 0.9 : 1.6), Math.max(ch, 1e-3), 0.08);
      m.position.set(-w / 2 + (k + 0.5) * (w / n) + Math.sin(Math.floor(f / 2) + k) * 0.01, ch / 2, hot ? 0.02 : 0);
    });
  };
  animate(g, 0, 1);
  return g;
}
/** Self-lit colour card for glows and light spilling through a gap; origin at the bottom centre. */
export function glow(w: number, h: number, color: number, opacity = 0.8): G {
  const g = card(w, h, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide }));
  g.userData.update = (_f: number, amount: number) => { ((g.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = opacity * amount; g.visible = amount > 0.01; };
  return g;
}

// ---------------------------------------------------------------- props

export function bottle(): G {
  return grp(cyl(0.04, 0.04, 0.2, 0x9fd0b0), cyl(0.015, 0.04, 0.07, 0x9fd0b0, 0, 0.2, 0), cyl(0.015, 0.015, 0.07, 0x9fd0b0, 0, 0.27, 0), orb(0.045, 0.02, 0.045, 0xd0202c, 0, 0.2, 0), orb(0.03, 0.03, 0.012, 0xd0202c, 0.04, 0.2, 0.04), orb(0.03, 0.03, 0.012, 0xd0202c, -0.04, 0.2, 0.04));
}
export function flute(): G {
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.012, 0.11, 14), mat(0xd9d2f0, { opacity: 0.75 }));
  bowl.position.y = 0.155;
  return grp(cyl(0.035, 0.035, 0.006, 0xe6e6f0), cyl(0.005, 0.005, 0.1, 0xe6e6f0), bowl);
}
export function iceBucket(): G {
  return grp(cyl(0.11, 0.085, 0.2, C.steel), cyl(0.115, 0.115, 0.015, 0xd6d8e2, 0, 0.2, 0));
}
export function burger(): G {
  return grp(orb(0.055, 0.02, 0.055, 0xd9a25a, 0, 0.012, 0), orb(0.058, 0.014, 0.058, 0x6a3a22, 0, 0.03, 0), orb(0.055, 0.032, 0.055, 0xd9a25a, 0, 0.05, 0));
}
/** Oval silver platter with a pile of burgers. */
export function platter(n = 8): G {
  const g = grp(orb(0.3, 0.012, 0.19, C.steel, 0, 0.006, 0));
  for (let i = 0; i < n; i++) {
    const b = burger();
    const a = (i / n) * Math.PI * 2;
    b.position.set(Math.cos(a) * 0.17, 0.012, Math.sin(a) * 0.09);
    g.add(b);
  }
  const b = burger(); b.position.set(0, 0.012, 0); g.add(b);
  return g;
}
/** Roasting tray with a charred roast. */
export function roast(): G {
  return grp(block(0.42, 0.04, 0.3, 0x9a9aa6, 0, 0, 0.15), orb(0.15, 0.09, 0.1, 0x6a2a22, 0, 0.1, 0), orb(0.1, 0.07, 0.08, 0x8a3a2a, 0.08, 0.11, 0.03));
}
/** Limp cloth (apron or towel) hanging from its origin. */
export function cloth(color = C.white): G {
  const m = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 8, 1, true), mat(color, { side: THREE.DoubleSide }));
  m.position.y = -0.25; m.scale.z = 0.4;
  return grp(m);
}
export function plate(): G { return grp(cyl(0.11, 0.07, 0.012, 0xeeeef4)); }

/**
 * Props a character can hold (PoseKey.holdL / holdR). Each is attached at the palm; `upright`
 * keeps it vertical however the hand turns.
 */
export const held: Record<string, { make: () => THREE.Object3D; upright?: boolean; offset?: [number, number, number] }> = {
  bottle: { make: bottle, upright: true, offset: [0, -0.1, 0] },
  flute: { make: flute, upright: true, offset: [0, -0.08, 0] },
  burger: { make: () => { const b = burger(); b.scale.setScalar(1.25); return b; }, upright: true, offset: [0, -0.01, 0.02] },
  platter: { make: platter, upright: true, offset: [0, 0.02, 0] },
  roast: { make: roast, upright: true },
  cloth: { make: cloth, upright: true },
  napkin: { make: () => { const c = cloth(); c.scale.setScalar(0.5); return c; }, upright: true },
};
