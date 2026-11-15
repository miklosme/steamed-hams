// Timeline player. The reference clip (with the original audio) is the master clock;
// the three.js scene underneath is drawn for whatever frame the clip is on, so the two
// can be compared at any opacity. The scene here is a placeholder animatic driven
// straight from the timeline data: it is the scaffold the real sets and characters go into.
import * as THREE from "three";
import { FPS, VISEME_OPEN, cameraAt, loadTimeline, shotAt, visemeAt } from "./timeline";
import type { Box, Shot, Timeline, Who } from "./timeline";

const ASPECT = 9 / 16;
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const video = $<HTMLVideoElement>("ref");
const canvas = $<HTMLCanvasElement>("gl");
// Set here, not in the HTML: the bundler would copy the file and serve it without byte ranges, which breaks seeking.
video.src = "/media/ref.mp4";

// Screen space: x 0..1 across the frame, y 0..9/16 downward (units of frame width).
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(0, 1, 0, ASPECT, -10, 10);

const SET_COLOUR: Record<string, number> = { exterior: 0x7fa8c9, dining_room: 0x8a86c4, kitchen: 0x6fa39a, title_wall: 0x5a4632 };
const WHO_COLOUR: Record<string, number> = { host: 0x3f8fa6, guest: 0x2b3f86, unknown: 0x888888 };

const flat = (color: number, opacity = 1) =>
  new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: opacity < 1, opacity });

const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1, ASPECT), flat(0x000000));
backdrop.position.set(0.5, ASPECT / 2, -5);
scene.add(backdrop);

// "World": the shot's reference picture. Moving this group is the camera move.
const world = new THREE.Group();
scene.add(world);
{
  const pts: number[] = [];
  for (let x = -3; x <= 8.001; x += 0.1) pts.push(x, -2, 0, x, 2, 0);
  for (let y = -2; y <= 2.001; y += 0.1) pts.push(-3, y, 0, 8, y, 0);
  const grid = new THREE.LineSegments(
    new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 }),
  );
  grid.position.z = -4;
  world.add(grid);
}

function rectMesh(color: number, opacity = 1) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), flat(color, opacity));
  m.visible = false;
  return m;
}
function place(m: THREE.Object3D, x0: number, y0: number, x1: number, y1: number, z: number) {
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, z);
  m.scale.set(Math.max(x1 - x0, 1e-4), Math.max(y1 - y0, 1e-4), 1);
  m.visible = true;
}

// Title-wall pictures live in the world (they ride the camera); the last one also has its own track.
const pictures = new THREE.Group();
world.add(pictures);
const lastPicture = rectMesh(0xd9c9a8);
scene.add(lastPicture);

// A placeholder puppet per character: body, head, mouth. Positioned in screen space from the tracks.
function puppet(who: Who) {
  const g = new THREE.Group();
  const body = rectMesh(WHO_COLOUR[who]!);
  const head = new THREE.Mesh(new THREE.CircleGeometry(0.5, 40), flat(0xf0c84a));
  const mouth = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), flat(0x3a1414));
  g.add(body, head, mouth);
  g.visible = false;
  scene.add(g);
  return { g, body, head, mouth };
}
const puppets = { host: puppet("host"), guest: puppet("guest") };

const boxLines = new THREE.LineSegments(
  new THREE.BufferGeometry(),
  new THREE.LineBasicMaterial({ vertexColors: true }),
);
boxLines.position.z = 5;
scene.add(boxLines);

let tl: Timeline;
let frame = -1;
let shot: Shot | undefined;
let mouthSource = "picture";
let showBoxes = true;

function buildPictures() {
  for (const p of tl.wall.pictures) {
    const [x0, y0, x1, y1] = p.rect;
    const border = rectMesh(0xa8632c);
    const art = rectMesh(p.id === "title_card" ? 0xd8c7a6 : 0x8fa0c8);
    place(border, x0, y0, x1, y1, 0);
    place(art, x0 + 0.03, y0 + 0.03, x1 - 0.03, y1 - 0.03, 0.01);
    const g = new THREE.Group();
    g.name = p.id;
    g.add(border, art);
    pictures.add(g);
  }
  // later pictures overlap earlier ones, except the title card, which sits on top of its neighbour
  pictures.children.forEach((g, i) => (g.position.z = i === 0 ? 1 : i * 0.05));
}

function draw(f: number) {
  frame = f;
  const s = shotAt(tl, f);
  shot = s;
  const t = f / FPS;
  (backdrop.material as THREE.MeshBasicMaterial).color.setHex(SET_COLOUR[s.set] ?? 0x333333);

  // camera: reference point (cx, cy) goes to the frame centre, scaled by zoom
  const c = cameraAt(tl, s, f);
  world.scale.set(c.zoom, c.zoom, 1);
  world.position.set(0.5 - c.zoom * c.cx, ASPECT / 2 - c.zoom * c.cy, 0);

  const wall = s.id === tl.wall.shot;
  pictures.visible = wall;
  lastPicture.visible = false;
  if (wall) {
    const lp = tl.wall.last_picture_screen;
    const own = f >= lp.f0;
    pictures.children[pictures.children.length - 1]!.visible = !own;
    if (own) {
      const r = lp.rects[Math.min(f - lp.f0, lp.rects.length - 1)]!;
      place(lastPicture, r[0], r[1] * ASPECT, r[2], r[3] * ASPECT, 2);
    }
  }

  // characters
  const lines: number[] = [];
  const colours: number[] = [];
  const seen: Partial<Record<Who, { box: Box; mouth: number | null }>> = {};
  for (const tr of tl.tracks[s.id] ?? []) {
    if (f < tr.f0 || f >= tr.f1) continue;
    const b = tr.boxes[f - tr.f0];
    if (!b) continue;
    const col = new THREE.Color(tr.part === "head" ? 0xff3366 : 0x33ff99);
    const [x0, y0, x1, y1] = [b[0], b[1] * ASPECT, b[2], b[3] * ASPECT];
    lines.push(x0, y0, 0, x1, y0, 0, x1, y0, 0, x1, y1, 0, x1, y1, 0, x0, y1, 0, x0, y1, 0, x0, y0, 0);
    for (let i = 0; i < 8; i++) colours.push(col.r, col.g, col.b);
    if (tr.part === "head" && (tr.who === "host" || tr.who === "guest")) {
      const prev = seen[tr.who];
      const area = (b[2] - b[0]) * (b[3] - b[1]);
      if (!prev || area > (prev.box[2] - prev.box[0]) * (prev.box[3] - prev.box[1])) {
        seen[tr.who] = { box: b, mouth: tr.mouth?.[f - tr.f0] ?? null };
      }
    }
  }
  boxLines.visible = showBoxes;
  boxLines.geometry.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
  boxLines.geometry.setAttribute("color", new THREE.Float32BufferAttribute(colours, 3));

  for (const who of ["host", "guest"] as const) {
    const p = puppets[who];
    const hit = seen[who];
    p.g.visible = !!hit;
    if (!hit) continue;
    const [x0, y0, x1, y1] = [hit.box[0], hit.box[1] * ASPECT, hit.box[2], hit.box[3] * ASPECT];
    const w = x1 - x0;
    const h = y1 - y0;
    const cx = (x0 + x1) / 2;
    p.head.position.set(cx, (y0 + y1) / 2, 1);
    p.head.scale.set(w, h, 1);
    place(p.body, cx - w * 1.1, y1 - h * 0.08, cx + w * 1.1, Math.max(y1 + h * 2.2, y1 + 0.05), 0.5);
    const open =
      mouthSource === "picture"
        ? Math.min(1, (hit.mouth ?? 0) / 0.1)
        : (VISEME_OPEN[visemeAt(tl, who, t)] ?? 0);
    p.mouth.position.set(cx + w * 0.12, y0 + h * 0.74, 1.5);
    p.mouth.scale.set(w * 0.42, Math.max(h * 0.035, h * 0.3 * open), 1);
  }

  renderer.render(scene, camera);
  hud(f, s, t);
}

// ---------------------------------------------------------------- panel

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
let hudShot = "";

function hud(f: number, s: Shot, t: number) {
  $("readout").textContent = `${s.id}  frame ${f}  (+${f - s.f0}/${s.f1 - s.f0})  ${t.toFixed(3)}s`;
  ($("scrub").querySelector("b") as HTMLElement).style.left = `${(f / tl.frames) * 100}%`;
  if (hudShot !== s.id) {
    hudShot = s.id;
    const cast = (s.cast ?? []).map((c) => `${c.who}: ${c.visible}, ${c.screen}, facing ${c.facing}`).join("<br>");
    $("shot").innerHTML =
      `${esc(s.summary ?? "")}<br><span style="color:var(--dim)">${esc(s.framing ?? "")}<br>` +
      `set ${s.set} · setup ${s.setup} · camera ${s.camera.static ? "static" : "moves"}<br>${cast}</span>`;
    $("beats").innerHTML = (s.beats ?? [])
      .map((b) => `<div class="beat" data-f="${b.f}"><b>${b.f}</b> ${esc(b.who)}: ${esc(b.action)}</div>`)
      .join("");
  }
  let lastOn: Element | undefined;
  for (const el of $("beats").children) {
    const on = Number((el as HTMLElement).dataset.f) <= f;
    el.classList.toggle("on", on);
    if (on) lastOn = el;
  }
  if (!video.paused) lastOn?.scrollIntoView({ block: "nearest" });
  const now = tl.lines.filter((l) => t >= l.t0 - 0.2 && t < l.t1 + 0.4);
  $("line").innerHTML = now
    .map((l) => {
      const words = l.words
        ? l.words.map((w) => `<span class="word${t >= w.t0 && t < w.t1 ? " on" : ""}">${esc(w.w)}</span>`).join(" ")
        : esc(l.text);
      return `<div><span style="color:var(--dim)">${l.id} ${l.who}:</span> ${words}</div>`;
    })
    .join("") || '<span style="color:var(--dim)">(none)</span>';
}

// ---------------------------------------------------------------- transport

const frameOfTime = (t: number) => Math.min(tl.frames - 1, Math.max(0, Math.floor(t * FPS + 1e-3)));

function seekFrame(f: number): Promise<void> {
  f = Math.min(tl.frames - 1, Math.max(0, Math.round(f)));
  return new Promise((resolve) => {
    video.addEventListener("seeked", () => { draw(f); resolve(); }, { once: true });
    video.currentTime = (f + 0.5) / FPS; // aim at the middle of the frame so rounding cannot slip to a neighbour
  });
}

function tick() {
  const f = frameOfTime(video.currentTime);
  if (f !== frame && !video.seeking) draw(f);
  requestAnimationFrame(tick);
}

function resize() {
  const r = canvas.parentElement!.getBoundingClientRect();
  renderer.setSize(r.width, r.height, false);
  if (tl) draw(Math.max(frame, 0));
}

async function main() {
  tl = await loadTimeline();
  buildPictures();
  const scrub = $("scrub");
  for (const s of tl.shots) {
    const i = document.createElement("i");
    i.style.left = `${(s.f0 / tl.frames) * 100}%`;
    scrub.append(i);
  }
  for (const l of tl.lines) {
    const sp = document.createElement("span");
    sp.style.left = `${(l.f0 / tl.frames) * 100}%`;
    sp.style.width = `${(Math.max(1, l.f1 - l.f0) / tl.frames) * 100}%`;
    sp.style.background = `#${(WHO_COLOUR[l.who] ?? 0x777777).toString(16).padStart(6, "0")}`;
    scrub.append(sp);
  }
  const scrubTo = (e: MouseEvent) => {
    const r = scrub.getBoundingClientRect();
    void seekFrame(((e.clientX - r.left) / r.width) * tl.frames);
  };
  scrub.addEventListener("mousedown", (e) => {
    scrubTo(e);
    const move = (ev: MouseEvent) => scrubTo(ev);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", () => window.removeEventListener("mousemove", move), { once: true });
  });

  const toggle = () => (video.paused ? void video.play() : video.pause());
  const step = (d: number) => { video.pause(); void seekFrame(frame + d); };
  const stepShot = (d: number) => {
    video.pause();
    const i = tl.shots.indexOf(shot!);
    const target = d < 0 && frame > shot!.f0 ? shot! : tl.shots[Math.min(tl.shots.length - 1, Math.max(0, i + d))]!;
    void seekFrame(target.f0);
  };
  $("play").onclick = toggle;
  $("prev").onclick = () => step(-1);
  $("next").onclick = () => step(1);
  $("prevShot").onclick = () => stepShot(-1);
  $("nextShot").onclick = () => stepShot(1);
  video.addEventListener("play", () => ($("play").textContent = "Pause"));
  video.addEventListener("pause", () => ($("play").textContent = "Play"));
  const opacity = $<HTMLInputElement>("opacity");
  const setOpacity = () => (video.style.opacity = opacity.value);
  opacity.oninput = setOpacity;
  setOpacity();
  $<HTMLSelectElement>("mouth").onchange = (e) => { mouthSource = (e.target as HTMLSelectElement).value; draw(frame); };
  $<HTMLInputElement>("boxes").onchange = (e) => { showBoxes = (e.target as HTMLInputElement).checked; draw(frame); };
  window.addEventListener("keydown", (e) => {
    if ((e.target as HTMLElement).tagName === "SELECT") return;
    if (e.code === "Space") { e.preventDefault(); toggle(); }
    else if (e.code === "ArrowLeft") { e.preventDefault(); e.shiftKey ? stepShot(-1) : step(-1); }
    else if (e.code === "ArrowRight") { e.preventDefault(); e.shiftKey ? stepShot(1) : step(1); }
    else if (e.key === "o") { opacity.value = opacity.value === "0" ? "0.5" : opacity.value === "1" ? "0" : "1"; setOpacity(); }
  });
  window.addEventListener("resize", resize);
  resize();
  const start = Number(new URLSearchParams(location.search).get("frame") ?? 0);
  await (video.readyState >= 1 ? Promise.resolve() : new Promise((r) => video.addEventListener("loadedmetadata", r, { once: true })));
  await seekFrame(start);
  requestAnimationFrame(tick);
  // for scripted capture: await player.seekFrame(n), then read the canvas
  Object.assign(window, { player: { seekFrame, get frame() { return frame; }, timeline: tl } });
}

main().catch((err) => { $("readout").textContent = String(err); console.error(err); });
