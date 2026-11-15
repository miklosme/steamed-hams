// What a shot file says: which stage, who is in it, and frame-stamped keys.
// See src/shots/README.md for the authoring guide.
import type * as THREE from "three";
import type { HandShape, Legs } from "./rig";
import type { Stage, View, XY } from "./stage";

/** Where a hand (wrist) goes. */
export type ArmSpec =
  | string // preset: down, hip, back, table, lap, chest, chin, head, up, out, side
  | { at: XY; z?: number } // screen position on that frame; z = metres toward the camera from the chest (default 0.2)
  | { ref: XY; z?: number } // same, in the stage's reference picture
  | { rel: [number, number, number] } // metres from the shoulder: outward, up, forward
  | { track: number } // follow the shot's n-th hand_or_other track
  | { world: [number, number, number] };

/** Head anchor: screen x, y of the head centre and head height (chin to crown) as a fraction of frame height. */
export type Pos = [number, number, number];

export interface PoseKey {
  /** first frame on which the change shows */
  f: number;
  /** frame on which it is complete (default f + 2; equal to f for a pop) */
  to?: number;
  /** head anchor on screen, or "track" to follow the measured head track (the default) */
  pos?: Pos | "track";
  /** head anchor in the stage's reference picture (stays put under camera moves) */
  rpos?: Pos;
  show?: boolean;
  /** body heading in degrees: 0 faces the camera, 90 faces screen right, -90 screen left, 180 away */
  face?: number;
  /** head [heading, pitch up, roll] in degrees, heading as for `face`; null = follow the body */
  head?: [number, number, number] | null;
  /** forward bend and sideways bend of the torso, degrees */
  lean?: number; sway?: number;
  /** gaze, -1..1: [screen right, up] relative to the head */
  eyes?: XY;
  /** 0 wide open .. 1 shut (default 0.2) */
  lids?: number;
  /** [height -1..1, slant: -1 angry .. 1 worried] */
  brows?: XY;
  /** -1 frown .. 1 smile, for the shut mouth */
  mouth?: number;
  /** 1 = bared teeth (grin or grimace) */
  teeth?: number;
  /** extra mouth opening 0..1 on top of the speech */
  open?: number;
  armL?: ArmSpec; armR?: ArmSpec; // the character's own left and right
  handL?: HandShape; handR?: HandShape;
  /** name of a prop from pieces.ts `held`, or null */
  holdL?: string | null; holdR?: string | null;
  legs?: Legs;
  /** walk phase: +1 per step */
  step?: number;
  footL?: { at: XY; z?: number } | null; footR?: { at: XY; z?: number } | null;
  apron?: boolean; bib?: boolean;
  /** body size relative to the head (default from the actor, else 0.85; 1 = realistic adult) */
  body?: number;
}

export interface ActorDef {
  /** how the head track becomes the anchor: size factor, offset in head heights, and where the size comes from */
  track?: { k?: number; ox?: number; oy?: number; size?: "median" | "track" | number; smooth?: number };
  keys: PoseKey[];
  /** frames on which a blink starts */
  blinks?: number[];
  /** body size relative to the head for the whole shot (default 0.85; 1 = realistic adult, about 7 heads tall) */
  body?: number;
  /** false = do not drive the mouth from the dialogue */
  speak?: boolean;
}

export interface PropKey {
  f: number; to?: number;
  at?: XY; // screen position of the prop's origin
  rat?: XY; // or in the reference picture
  depth?: number;
  h?: number; // fraction of frame height
  scale?: number;
  yaw?: number;
  rot?: [number, number, number];
  show?: boolean;
}
export interface PropDef { make: () => THREE.Object3D; keys: PropKey[] }

export interface VarKey { f: number; to?: number; [name: string]: number | undefined }

export interface ShotDef {
  /** stage id; defaults to the shot's setup id from the timeline */
  stage?: string;
  /** places this shot's first frame inside the stage picture; overrides the measured setup_rel / punch-in */
  view?: View;
  actors?: { host?: ActorDef; guest?: ActorDef };
  /** keys for stage variables (door angles, smoke, fire) and the engine's own: fade, light */
  vars?: VarKey[];
  props?: PropDef[];
}

export const shots = new Map<string, ShotDef>();
export const stages = new Map<string, (s: Stage) => void>();
export function defineShot(id: string, def: ShotDef) { shots.set(id, def); }
export function defineStage(id: string, build: (s: Stage) => void) { stages.set(id, build); }

// ---------------------------------------------------------------- key tracks

interface K { f: number; to: number; v: unknown }
export type Tracks = Map<string, K[]>;

export function buildTracks(keys: readonly object[]): Tracks {
  const out: Tracks = new Map();
  const sorted = [...keys].sort((a, b) => (a as { f: number }).f - (b as { f: number }).f);
  for (const key of sorted) {
    const k = key as Record<string, unknown> & { f: number; to?: number };
    for (const [name, v] of Object.entries(k)) {
      if (name === "f" || name === "to" || v === undefined) continue;
      let list = out.get(name);
      if (!list) out.set(name, (list = []));
      list.push({ f: k.f, to: Math.max(k.to ?? k.f + 2, k.f), v });
    }
  }
  return out;
}

const ease = (t: number) => t * t * (3 - 2 * t);

/** The value a track is moving from, the one it is moving to, and how far along (0..1). */
export function sample(tr: Tracks, name: string, f: number): { a: unknown; b: unknown; t: number } | undefined {
  const list = tr.get(name);
  if (!list) return undefined;
  let i = -1;
  for (let n = 0; n < list.length; n++) if (list[n]!.f <= f) i = n; else break;
  if (i < 0) return { a: list[0]!.v, b: list[0]!.v, t: 1 }; // before the first key: hold it
  const k = list[i]!;
  if (i === 0 || f >= k.to) return { a: k.v, b: k.v, t: 1 };
  return { a: list[i - 1]!.v, b: k.v, t: ease((f - k.f + 1) / (k.to - k.f + 1)) };
}

export function num(tr: Tracks, name: string, f: number, dflt: number): number {
  const s = sample(tr, name, f);
  if (!s) return dflt;
  return s.t >= 1 ? (s.b as number) : (s.a as number) + ((s.b as number) - (s.a as number)) * s.t;
}
export function vec<T extends number[]>(tr: Tracks, name: string, f: number, dflt: T): T {
  const s = sample(tr, name, f);
  if (!s || !s.b) return dflt;
  const a = (s.a ?? s.b) as number[], b = s.b as number[];
  return b.map((x, i) => (a[i] ?? x) + (x - (a[i] ?? x)) * s.t) as T;
}
/** Stepped value: switches on the key's first frame. */
export function step<T>(tr: Tracks, name: string, f: number, dflt: T): T {
  const s = sample(tr, name, f);
  return s ? (s.b as T) : dflt;
}
