// S14, the title sequence: a wall of framed pictures. The camera pull-back and pan come from
// camera.json; the picture rectangles and the last picture's own growth from title_wall.json.
import * as THREE from "three";
import * as P from "../pieces";
import { defineShot, defineStage } from "../dsl";
import { ASPECT, screenToRef } from "../stage";
import type { Rect } from "../stage";
import wall from "../../timeline/title_wall.json";

const DEPTH = 6;
const ARTS: (P.Art | number)[] = [0xe9dcc0, "landscape", "boat", "red", "fruit", "portrait"];
/** layer coordinates (frame widths from the first frame's centre) to ref */
const toRef = (r: number[]): Rect => [r[0]! + 0.5, r[1]! * ASPECT + 0.5, r[2]! + 0.5, r[3]! * ASPECT + 0.5];

/** The title card: two heads and bands where the lettering goes. No text; the video model writes its own. */
function titleCard(w: number, h: number) {
  const g = P.picture(w, h, { frame: 0xa8632c, art: 0xe9dcc0 });
  g.add(P.orb(h * 0.13, h * 0.15, 0.01, 0xe9b48c, -w * 0.33, h * 0.68, 0.02), P.orb(h * 0.14, h * 0.15, 0.01, 0xd9a27c, w * 0.34, h * 0.3, 0.02));
  for (const [x, y, len] of [[-0.02, 0.66, 0.4], [0.0, 0.5, 0.2], [-0.02, 0.34, 0.5]] as const) {
    const bar = P.block(w * len, h * 0.09, 0.01, 0x4a2a7a, w * x, h * y, 0.03);
    bar.rotation.z = 0.12;
    g.add(bar);
  }
  return g;
}

defineStage("K13", (s) => {
  s.cam({ fov: 18, bg: 0x6b5238 });
  s.card(0x6b5238, DEPTH + 0.2, [-2, -3, 8, 4]);
  // woven wallpaper: a grid of darker threads
  const pts: number[] = [];
  const a = s.point(-1, -1.2, DEPTH + 0.15), b = s.point(6.5, 1.6, DEPTH + 0.15);
  for (let x = a.x; x < b.x; x += 0.07) pts.push(x, a.y, a.z, x, b.y, a.z);
  for (let y = b.y; y < a.y; y += 0.07) pts.push(a.x, y, a.z, b.x, y, a.z);
  s.root.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)), new THREE.LineBasicMaterial({ color: 0x4a3826 })));

  const pics = wall.pictures.map((p, i) => {
    const rect = toRef(p.rect);
    // later pictures overlap earlier ones, except the title card, which sits on top of its neighbour
    const depth = DEPTH - (i === 0 ? 0.12 : i * 0.015);
    return s.fit((w, h) => (i === 0 ? titleCard(w, h) : P.picture(w, h, { frame: 0xa8632c, art: ARTS[i] })), rect, depth);
  });
  const last = pics[pics.length - 1]!;
  const lp = wall.last_picture_screen;
  const home = { pos: last.position.clone(), rect: toRef(wall.pictures[wall.pictures.length - 1]!.rect) };
  s.on(({ f, view }) => {
    if (f < lp.f0) { last.position.copy(home.pos); last.scale.setScalar(1); return; }
    // the last picture grows on its own: follow its measured screen rectangle
    const r = lp.rects[Math.min(f - lp.f0, lp.rects.length - 1)]!;
    const [x0, y0] = screenToRef(view, r[0]!, r[1]!), [x1, y1] = screenToRef(view, r[2]!, r[3]!);
    const depth = DEPTH - 0.3;
    last.position.copy(s.point((x0 + x1) / 2, y1, depth));
    last.scale.setScalar(((y1 - y0) / (home.rect[3] - home.rect[1])) * (depth / (DEPTH - 0.075)));
  });
});

defineShot("S14", {});
