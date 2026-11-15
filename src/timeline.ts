// Types and loaders for the files in timeline/ (see timeline/README.md).

export const FPS = 24000 / 1001;

export type Who = "host" | "guest" | "mother" | "chorus" | "unknown";
export type Box = [number, number, number, number];

export interface Beat { f: number; f_end?: number; who: string; action: string }
export interface CastEntry { who: Who; visible: string; screen: string; facing: string; costume?: string }
export interface Shot {
  id: string; f0: number; f1: number; set: string; setup: string;
  camera: { static: boolean };
  lines: string[];
  setup_rel?: { zoom: number; cx: number; cy: number };
  cut_in?: { kind: string; zoom: number; dx: number; dy: number };
  summary?: string; framing?: string; cast?: CastEntry[]; beats?: Beat[];
}
export interface Phone { p: string; v: string; t0: number; t1: number }
export interface Word { w: string; t0: number; t1: number; phones: Phone[] }
export interface Line {
  id: string; who: Who; kind: "speech" | "sound" | "sung"; text: string;
  t0: number; t1: number; f0: number; f1: number; words?: Word[];
}
export interface Track { who: Who; part: "head" | "hand_or_other"; f0: number; f1: number; boxes: (Box | null)[]; mouth?: (number | null)[] }
export interface CameraCurve { f0: number; zoom: number[]; cx: number[]; cy: number[] }
export interface TitleWall {
  shot: string; f0: number; f1: number;
  pictures: { id: string; rect: Box }[];
  last_picture_screen: { f0: number; rects: Box[] };
}

export interface Timeline {
  frames: number;
  shots: Shot[];
  lines: Line[];
  pictureLead: number;
  envelope: number[];
  tracks: Record<string, Track[]>;
  camera: Record<string, CameraCurve>;
  wall: TitleWall;
}

async function get<T>(name: string): Promise<T> {
  const res = await fetch(`/timeline/${name}`);
  if (!res.ok) throw new Error(`${name}: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function loadTimeline(): Promise<Timeline> {
  const [tl, script, tracks, camera, wall] = await Promise.all([
    get<{ source: { frames: number }; shots: Shot[] }>("timeline.json"),
    get<{ lines: Line[]; sync: { reference_picture_lead_frames: number }; voice_envelope: { values: number[] } }>("script.json"),
    get<{ shots: Record<string, Track[]> }>("tracks.json"),
    get<{ shots: Record<string, CameraCurve> }>("camera.json"),
    get<TitleWall>("title_wall.json"),
  ]);
  return {
    frames: tl.source.frames,
    shots: tl.shots,
    lines: script.lines,
    pictureLead: script.sync.reference_picture_lead_frames,
    envelope: script.voice_envelope.values,
    tracks: tracks.shots,
    camera: camera.shots,
    wall,
  };
}

export function shotAt(tl: Timeline, f: number): Shot {
  return tl.shots.find((s) => f >= s.f0 && f < s.f1) ?? tl.shots[tl.shots.length - 1]!;
}

/** Camera at frame f: zoom about (cx, cy) of the shot's first frame; identity for static shots. */
export function cameraAt(tl: Timeline, shot: Shot, f: number) {
  const c = tl.camera[shot.id];
  if (!c) return { zoom: 1, cx: 0, cy: 0 };
  const k = Math.min(Math.max(f - c.f0, 0), c.zoom.length - 1);
  return { zoom: c.zoom[k]!, cx: c.cx[k]!, cy: c.cy[k]! };
}

/** Mouth shape heard at time t for one speaker, from the aligned script. */
export function visemeAt(tl: Timeline, who: Who, t: number): string {
  for (const line of tl.lines) {
    if (line.who !== who || t < line.t0 || t >= line.t1) continue;
    if (!line.words) return "AI";
    for (const w of line.words) for (const p of w.phones) if (t >= p.t0 && t < p.t1) return p.v;
  }
  return "X";
}

export const VISEME_OPEN: Record<string, number> = { X: 0, MBP: 0, FV: 0.15, L: 0.35, C: 0.2, E: 0.45, U: 0.35, O: 0.7, AI: 1 };
