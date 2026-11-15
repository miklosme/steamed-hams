// Draws the animation for one source frame. Everything is a pure function of the frame number.
import * as THREE from "three";
import { buildTracks, num, sample, shots, stages, step, vec } from "./dsl";
import type { ActorDef, ArmSpec, Pos, PropDef, ShotDef, Tracks } from "./dsl";
import { held } from "./pieces";
import { GUEST_STYLE, HEAD_H, HOST_STYLE, Rig } from "./rig";
import type { HandShape, Legs, RigPose } from "./rig";
import { ASPECT, IDENTITY, Stage, compose, screenToRef } from "./stage";
import type { FrameCtx, View, XY } from "./stage";
import { FPS, VISEME_OPEN, cameraAt, shotAt } from "./timeline";
import type { Box, Shot, Timeline, Track } from "./timeline";
import "./shots";

type Who = "host" | "guest";
const WHOS: Who[] = ["host", "guest"];
/** Frames the mouth runs ahead of the sound, as lips do. */
const MOUTH_LEAD = 1;
/** Bodies are drawn small for their heads, as in the cartoon the staging was read from. */
const DEFAULT_BODY = 0.85;
const VISEME_WIDE: Record<string, number> = { X: 1, MBP: 0.9, FV: 1, L: 0.9, C: 1, E: 1.25, U: 0.6, O: 0.7, AI: 1.05 };
const SET_BG: Record<string, number> = { exterior: 0x8fc4ea, dining_room: 0x8f94d8, kitchen: 0x8fb9a8, title_wall: 0x6b5238 };

/** Shoulder-relative presets: [outward, up, forward] metres. */
const ARM_PRESETS: Record<string, [number, number, number]> = {
  hip: [0.05, -0.4, 0.06], back: [-0.14, -0.48, -0.14], table: [-0.04, -0.3, 0.34], lap: [-0.08, -0.46, 0.22],
  chest: [-0.15, -0.18, 0.17], chin: [-0.17, 0.06, 0.17], head: [-0.03, 0.24, 0.1], up: [0.06, 0.52, 0.05],
  out: [0, -0.04, 0.52], side: [0.52, 0, 0], belly: [-0.14, -0.33, 0.2],
};

const FACING: Record<string, number> = { left: -80, right: 80, camera: 0, away: 180, "3/4 left": -40, "3/4 right": 40, "3/4 away left": -140, "3/4 away right": 140 };

interface ActorRt {
  def: ActorDef;
  tracks: Tracks;
  head?: { f0: number; pos: (Pos | null)[] }; // merged, filled, smoothed head track in screen space
  hands: Track[];
  blink: Set<number>[]; // [half, shut]
  face0: number;
}
interface PropRt { obj: THREE.Object3D; tracks: Tracks; height: number }
interface ShotRt { shot: Shot; def: ShotDef; stage: Stage; placement: View; actors: Partial<Record<Who, ActorRt>>; vars: Tracks; props: PropRt[] }

export class Engine {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(18, ASPECT, 0.05, 400);
  rigs: Record<Who, Rig> = { host: new Rig(HOST_STYLE), guest: new Rig(GUEST_STYLE) };
  /** last frame's resolved shot, for the player's readout */
  current?: ShotRt;
  private hemi = new THREE.HemisphereLight(0xffffff, 0xb4b2c4, 1.6);
  private sun = new THREE.DirectionalLight(0xffffff, 1.5);
  private fadeMesh: THREE.Mesh;
  private stageCache = new Map<string, Stage>();
  private shotCache = new Map<string, ShotRt>();
  private speech: Record<Who, { open: Float32Array; wide: Float32Array }>;
  private heldCache = new Map<string, THREE.Object3D>();
  private propRoot = new THREE.Group();
  /** head depth (metres from the camera) of each visible character on the last frame, for authoring */
  depths: Partial<Record<Who, number>> = {};

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas, public tl: Timeline, opts: { preserve?: boolean } = {}) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: opts.preserve ?? true });
    this.sun.position.set(-2, 5, 6);
    this.scene.add(this.hemi, this.sun, this.propRoot);
    for (const w of WHOS) this.scene.add(this.rigs[w].group);
    this.fadeMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, depthTest: false, depthWrite: false }));
    this.fadeMesh.renderOrder = 999;
    this.fadeMesh.frustumCulled = false;
    this.camera.add(this.fadeMesh);
    this.fadeMesh.position.z = -0.1;
    this.scene.add(this.camera);
    this.speech = { host: this.bakeSpeech("host"), guest: this.bakeSpeech("guest") };
  }

  setSize(w: number, h: number) { this.renderer.setSize(w, h, false); }

  // ---------------------------------------------------------------- speech

  private bakeSpeech(who: Who) {
    const n = this.tl.frames;
    const raw = new Float32Array(n), wide = new Float32Array(n).fill(1);
    const env = this.tl.envelope;
    for (const line of this.tl.lines) {
      if (line.who !== who) continue;
      for (let f = Math.max(0, line.f0 - 2); f < Math.min(n, line.f1 + 2); f++) {
        const t = (f + 0.5 + MOUTH_LEAD) / FPS;
        const e = Math.min(1, (env[Math.min(n - 1, f + MOUTH_LEAD)] ?? 0) * 1.3);
        if (!line.words) {
          if (t >= line.t0 && t < line.t1) raw[f] = Math.max(raw[f]!, 0.25 + 0.75 * e);
          continue;
        }
        for (const w of line.words) for (const p of w.phones) {
          if (t < p.t0 || t >= p.t1) continue;
          raw[f] = (VISEME_OPEN[p.v] ?? 0) * (0.45 + 0.55 * e);
          wide[f] = VISEME_WIDE[p.v] ?? 1;
        }
      }
    }
    const open = new Float32Array(n);
    for (let f = 0; f < n; f++) open[f] = 0.6 * raw[f]! + 0.2 * (raw[f - 1] ?? 0) + 0.2 * (raw[f + 1] ?? 0);
    return { open, wide };
  }

  // ---------------------------------------------------------------- shot setup

  private stageFor(id: string, set: string): Stage {
    let s = this.stageCache.get(id);
    if (s) return s;
    s = new Stage(id);
    s.cam({});
    const build = stages.get(id);
    if (build) build(s);
    else {
      s.cam({ bg: SET_BG[set] ?? 0x555555 });
      s.card(SET_BG[set] ?? 0x555555, 8);
    }
    s.root.visible = false;
    this.scene.add(s.root);
    this.stageCache.set(id, s);
    return s;
  }

  private placement(shot: Shot): View {
    const i = this.tl.shots.indexOf(shot);
    if (shot.setup_rel) return { zoom: shot.setup_rel.zoom, cx: shot.setup_rel.cx, cy: shot.setup_rel.cy };
    if (shot.cut_in && i > 0) {
      const c = shot.cut_in;
      return compose(this.shotRt(this.tl.shots[i - 1]!).placement, { zoom: c.zoom, cx: -c.dx / c.zoom, cy: -c.dy / c.zoom });
    }
    return IDENTITY;
  }

  private shotRt(shot: Shot): ShotRt {
    let rt = this.shotCache.get(shot.id);
    if (rt) return rt;
    const def = shots.get(shot.id) ?? this.autoDef(shot);
    const stage = this.stageFor(def.stage ?? shot.setup, shot.set);
    rt = { shot, def, stage, placement: def.view ?? this.placement(shot), actors: {}, vars: buildTracks(def.vars ?? []), props: [] };
    this.shotCache.set(shot.id, rt);
    const tracks = this.tl.tracks[shot.id] ?? [];
    for (const who of WHOS) {
      const a = def.actors?.[who];
      if (!a) continue;
      const keys = a.keys.map((k) => (k.rpos ? { ...k, rpos: undefined, pos: { ref: k.rpos } } : k));
      const cast = shot.cast?.find((c) => c.who === who);
      const half = new Set<number>(), shut = new Set<number>();
      for (const b of a.blinks ?? []) { half.add(b); shut.add(b + 1); shut.add(b + 2); half.add(b + 3); }
      rt.actors[who] = {
        def: a, tracks: buildTracks(keys), head: this.headTrack(tracks, who, shot, a), hands: tracks.filter((t) => t.part === "hand_or_other"),
        blink: [half, shut], face0: FACING[cast?.facing ?? ""] ?? 0,
      };
    }
    for (const p of def.props ?? []) rt.props.push(this.makeProp(p));
    return rt;
  }

  private makeProp(p: PropDef): PropRt {
    const obj = p.make();
    const box = new THREE.Box3().setFromObject(obj);
    obj.visible = false;
    this.propRoot.add(obj);
    const keys = p.keys.map((k) => (k.rat ? { ...k, rat: undefined, at: { ref: k.rat } } : k));
    return { obj, tracks: buildTracks(keys), height: Math.max(1e-6, box.max.y - box.min.y) };
  }

  /** Shots nobody has written yet still play: tracked heads, facing from the cast notes. */
  private autoDef(shot: Shot): ShotDef {
    const actors: ShotDef["actors"] = {};
    for (const who of WHOS) {
      if ((this.tl.tracks[shot.id] ?? []).some((t) => t.who === who && t.part === "head")) actors[who] = { keys: [{ f: shot.f0 }] };
    }
    return { actors };
  }

  /** Merge a character's head-track segments into one gap-free, smoothed anchor track. */
  private headTrack(tracks: Track[], who: Who, shot: Shot, a: ActorDef): ActorRt["head"] {
    const segs = tracks.filter((t) => t.who === who && t.part === "head");
    if (!segs.length) return undefined;
    const n = shot.f1 - shot.f0;
    const boxes: (Box | null)[] = new Array(n).fill(null);
    for (const t of segs) t.boxes.forEach((b, k) => {
      const i = t.f0 + k - shot.f0;
      if (!b || i < 0 || i >= n) return;
      const old = boxes[i];
      if (!old || (b[2] - b[0]) * (b[3] - b[1]) > (old[2] - old[0]) * (old[3] - old[1])) boxes[i] = b;
    });
    const known = boxes.map((b, i) => (b ? i : -1)).filter((i) => i >= 0);
    if (!known.length) return undefined;
    const o = a.track ?? {};
    const k = o.k ?? (who === "guest" ? 1 : 1.1), ox = o.ox ?? 0, oy = o.oy ?? -0.07;
    // sizes are compared in the reference picture, so a zoom during the shot does not skew them
    const zoom = (i: number) => cameraAt(this.tl, shot, shot.f0 + i).zoom;
    const heights = known.map((i) => (boxes[i]![3] - boxes[i]![1]) / zoom(i)).sort((x, y) => x - y);
    const median = heights[heights.length >> 1]!;
    const raw: Pos[] = [];
    for (let i = 0; i < n; i++) {
      let b = boxes[i];
      if (!b) { // fill gaps: interpolate between neighbours, hold at the ends
        const prev = known.filter((j) => j < i).pop(), next = known.find((j) => j > i);
        if (prev === undefined) b = boxes[next!]!;
        else if (next === undefined) b = boxes[prev]!;
        else { const t = (i - prev) / (next - prev), p = boxes[prev]!, q = boxes[next]!; b = p.map((v, c) => v + (q[c]! - v) * t) as Box; }
      }
      const h = typeof o.size === "number" ? o.size : (o.size === "track" ? b[3] - b[1] : median * zoom(i)) * k;
      raw.push([(b[0] + b[2]) / 2 + ox * h / ASPECT, (b[1] + b[3]) / 2 + oy * h, h]);
    }
    // median-of-5 then a short average: removes blob jitter, keeps the pose-to-pose snaps
    const win = o.smooth ?? 2;
    const med = raw.map((_, i) => [0, 1, 2].map((c) => {
      const v = [-2, -1, 0, 1, 2].map((d) => raw[Math.min(n - 1, Math.max(0, i + d))]![c]!).sort((x, y) => x - y);
      return v[2]!;
    }) as Pos);
    const pos = med.map((_, i) => [0, 1, 2].map((c) => {
      const w = c === 2 ? Math.max(win, 6) : win;
      let s = 0, m = 0;
      for (let d = -w; d <= w; d++) { s += med[Math.min(n - 1, Math.max(0, i + d))]![c]!; m++; }
      return s / m;
    }) as Pos);
    return { f0: shot.f0, pos };
  }

  // ---------------------------------------------------------------- frame

  render(f: number) {
    f = Math.min(this.tl.frames - 1, Math.max(0, Math.round(f)));
    const shot = shotAt(this.tl, f);
    const rt = this.shotRt(shot);
    this.current = rt;
    const stage = rt.stage;
    for (const s of this.stageCache.values()) s.root.visible = s === stage;
    for (const r of this.shotCache.values()) for (const p of r.props) p.obj.visible = false;

    const view = compose(rt.placement, cameraAt(this.tl, shot, f));
    const cam = this.camera;
    cam.fov = stage.fov;
    cam.quaternion.copy(stage.quaternion);
    cam.updateProjectionMatrix();
    // rostrum move: zoom and slide the projected picture
    const m = new THREE.Matrix4().set(view.zoom, 0, 0, -view.zoom * 2 * view.cx, 0, view.zoom, 0, view.zoom * 2 * view.cy * ASPECT, 0, 0, 1, 0, 0, 0, 0, 1);
    cam.projectionMatrix.premultiply(m);
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    cam.updateMatrixWorld(true);

    const vars: Record<string, number> = { ...stage.defaults };
    for (const name of rt.vars.keys()) vars[name] = num(rt.vars, name, f, 0);
    const ctx: FrameCtx = { f, f0: shot.f0, view, vars, shot: shot.id };
    stage.update(ctx);
    this.scene.background = stage.background;
    const light = vars.light ?? 1;
    this.hemi.intensity = 1.6 * light;
    this.sun.intensity = 1.5 * light;
    (this.fadeMesh.material as THREE.MeshBasicMaterial).opacity = vars.fade ?? 0;
    this.fadeMesh.visible = (vars.fade ?? 0) > 0.001;

    this.depths = {};
    for (const who of WHOS) {
      const a = rt.actors[who];
      const rig = this.rigs[who];
      rig.group.visible = !!a && this.pose(who, a, rt, f, view);
    }
    for (const p of rt.props) this.poseProp(p, stage, f, view);
    this.renderer.render(this.scene, cam);
  }

  private refPoint(stage: Stage, view: View, at: XY | { ref: XY }, depth: number) {
    const r = Array.isArray(at) ? screenToRef(view, at[0], at[1]) : at.ref;
    return stage.point(r[0], r[1], depth);
  }

  private anchor(a: ActorRt, v: unknown, f: number, view: View): Pos | null {
    if (v === "track" || v === undefined) {
      const h = a.head;
      if (!h) return null;
      const p = h.pos[Math.min(h.pos.length - 1, Math.max(0, f - h.f0))]!;
      const r = screenToRef(view, p[0], p[1]);
      return [r[0], r[1], p[2] / view.zoom];
    }
    if (Array.isArray(v)) { const r = screenToRef(view, v[0] as number, v[1] as number); return [r[0], r[1], (v[2] as number) / view.zoom]; }
    return (v as { ref: Pos }).ref;
  }

  private pose(who: Who, a: ActorRt, rt: ShotRt, f: number, view: View): boolean {
    const tr = a.tracks, stage = rt.stage, rig = this.rigs[who];
    if (!step(tr, "show", f, true)) return false;
    // head anchor in the reference picture, then out to a depth that gives the right size
    const ps = sample(tr, "pos", f);
    let ref: Pos | null;
    if (!ps) ref = this.anchor(a, "track", f, view);
    else {
      const A = this.anchor(a, ps.a, f, view), B = this.anchor(a, ps.b, f, view);
      ref = A && B ? (B.map((b, i) => A[i]! + (b - A[i]!) * ps.t) as Pos) : B ?? A;
    }
    if (!ref) return false;
    const depth = stage.depthFor(HEAD_H, ref[2]);
    const head = stage.point(ref[0], ref[1], depth);
    this.depths[who] = Math.round(depth * 100) / 100;
    const toCam = new THREE.Vector3(-head.x, 0, -head.z).normalize();
    const yaw0 = Math.atan2(toCam.x, toCam.z);
    const rad = THREE.MathUtils.degToRad;
    const face = num(tr, "face", f, a.face0);
    const hs = sample(tr, "head", f);
    const follow: [number, number, number] = [face, 0, 0];
    let hd = follow;
    if (hs) {
      const A = (hs.a as number[] | null) ?? follow, B = (hs.b as number[] | null) ?? follow;
      hd = B.map((b, i) => A[i]! + (b - A[i]!) * hs.t) as [number, number, number];
    }
    // the neck only turns so far
    const rel = THREE.MathUtils.clamp(((hd[0] - face + 540) % 360) - 180, -85, 85);
    const headQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(rad(-hd[1]), yaw0 + rad(face + rel), rad(hd[2]), "YXZ"));

    let lids = num(tr, "lids", f, 0.2);
    if (a.blink[1]!.has(f)) lids = 1; else if (a.blink[0]!.has(f)) lids = Math.max(lids, 0.6);
    const sp = this.speech[who];
    const speaking = a.def.speak !== false;
    const pose: RigPose = {
      head, yaw: yaw0 + rad(face), lean: rad(num(tr, "lean", f, 0)), sway: rad(num(tr, "sway", f, 0)), headQ,
      handL: null, handR: null,
      shapeL: step<HandShape>(tr, "handL", f, "open"), shapeR: step<HandShape>(tr, "handR", f, "open"),
      legs: step<Legs>(tr, "legs", f, "stand"), step: num(tr, "step", f, 0), floorY: stage.floorY,
      footL: null, footR: null,
      eyes: vec(tr, "eyes", f, [0, 0] as XY), lids, brows: vec(tr, "brows", f, [0, 0] as XY),
      mouth: num(tr, "mouth", f, 0), teeth: num(tr, "teeth", f, 0),
      open: Math.min(1.2, num(tr, "open", f, 0) + (speaking ? sp.open[f]! : 0)), wide: speaking ? sp.wide[f]! : 1,
      apron: step(tr, "apron", f, false), bib: step(tr, "bib", f, false), body: num(tr, "body", f, a.def.body ?? DEFAULT_BODY), toCamera: toCam,
    };
    // hands and feet need the body in place first: solve once without them, read the chest, then resolve targets
    rig.update(pose);
    const chestDepth = -rig.j.chest.clone().applyQuaternion(stage.quaternion.clone().invert()).z;
    const arm = (side: 1 | -1) => {
      const s = sample(tr, side === 1 ? "armL" : "armR", f);
      if (!s) return null;
      const A = this.armTarget(s.a as ArmSpec, side, rig, stage, view, chestDepth, a, f);
      const B = this.armTarget(s.b as ArmSpec, side, rig, stage, view, chestDepth, a, f);
      return s.t >= 1 ? B : A.lerp(B, s.t);
    };
    pose.handL = arm(1);
    pose.handR = arm(-1);
    for (const side of ["footL", "footR"] as const) {
      const ft = step<{ at: XY; z?: number } | null>(tr, side, f, null);
      if (ft) pose[side] = this.refPoint(stage, view, ft.at, chestDepth - (ft.z ?? 0));
    }
    rig.update(pose);
    this.hold(who, "L", step<string | null>(tr, "holdL", f, null));
    this.hold(who, "R", step<string | null>(tr, "holdR", f, null));
    return true;
  }

  private restHand(side: 1 | -1, rig: Rig) {
    const s = rig.style;
    const sh = side === 1 ? rig.j.shL : rig.j.shR;
    return sh.clone().add(new THREE.Vector3(side * 0.05, -(s.upperArm + s.foreArm) * 0.8, 0.04).applyQuaternion(rig.bodyQ));
  }

  private armTarget(spec: ArmSpec, side: 1 | -1, rig: Rig, stage: Stage, view: View, chestDepth: number, a: ActorRt, f: number): THREE.Vector3 {
    const sh = side === 1 ? rig.j.shL : rig.j.shR;
    if (typeof spec === "string") {
      const p = ARM_PRESETS[spec];
      if (!p) return this.restHand(side, rig);
      return sh.clone().add(new THREE.Vector3(side * p[0], p[1], p[2]).applyQuaternion(rig.bodyQ));
    }
    if ("rel" in spec) return sh.clone().add(new THREE.Vector3(side * spec.rel[0], spec.rel[1], spec.rel[2]).applyQuaternion(rig.bodyQ));
    if ("world" in spec) return new THREE.Vector3(...spec.world);
    if ("track" in spec) {
      const t = a.hands[spec.track];
      if (!t) return this.restHand(side, rig);
      let k = Math.min(t.boxes.length - 1, Math.max(0, f - t.f0));
      let b = t.boxes[k];
      for (let d = 1; !b && d < t.boxes.length; d++) b = t.boxes[k - d] ?? t.boxes[k + d];
      if (!b) return this.restHand(side, rig);
      // average with neighbours to calm the blob
      let x = 0, y = 0, n = 0;
      for (let d = -1; d <= 1; d++) { const q = t.boxes[k + d]; if (q) { x += (q[0] + q[2]) / 2; y += (q[1] + q[3]) / 2; n++; } }
      if (!n) { x = (b[0] + b[2]) / 2; y = (b[1] + b[3]) / 2; n = 1; }
      return this.refPoint(stage, view, [x / n, y / n], chestDepth - 0.2);
    }
    if ("ref" in spec) return this.refPoint(stage, view, { ref: spec.ref }, chestDepth - (spec.z ?? 0.2));
    return this.refPoint(stage, view, spec.at, chestDepth - (spec.z ?? 0.2));
  }

  private hold(who: Who, side: "L" | "R", name: string | null) {
    const rig = this.rigs[who];
    const hand = side === "L" ? rig.handL : rig.handR;
    for (const c of hand.grip.children) c.visible = false;
    if (!name || !held[name]) return;
    const key = `${who}${side}${name}`;
    let obj = this.heldCache.get(key);
    if (!obj) {
      obj = new THREE.Group().add(held[name]!.make());
      const o = held[name]!.offset ?? [0, 0, 0];
      obj.children[0]!.position.add(new THREE.Vector3(...o));
      hand.grip.add(obj);
      this.heldCache.set(key, obj);
    }
    obj.visible = true;
    if (held[name]!.upright) obj.quaternion.copy(hand.group.quaternion).invert();
  }

  private poseProp(p: PropRt, stage: Stage, f: number, view: View) {
    const tr = p.tracks;
    const s = sample(tr, "at", f);
    p.obj.visible = !!s && step(tr, "show", f, true);
    if (!s || !p.obj.visible) return;
    const depth = num(tr, "depth", f, 3);
    const A = this.refPoint(stage, view, s.a as XY, depth), B = this.refPoint(stage, view, s.b as XY, depth);
    p.obj.position.copy(A.lerp(B, s.t));
    const h = num(tr, "h", f, 0);
    p.obj.scale.setScalar(h ? (h / view.zoom) * stage.span(depth) / p.height : num(tr, "scale", f, 1));
    const rot = vec(tr, "rot", f, [0, 0, 0] as [number, number, number]);
    const rad = THREE.MathUtils.degToRad;
    p.obj.rotation.order = "YXZ";
    p.obj.rotation.set(rad(rot[0]), rad(num(tr, "yaw", f, 0) + rot[1]), rad(rot[2]));
  }
}
