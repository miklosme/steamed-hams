// A stage is the diorama behind one camera setup: a perspective camera at the world origin
// and set pieces placed by where they sit in the setup's reference picture.
//
// Reference-picture coordinates ("ref"): x 0..1 across the frame, y 0..1 down, as seen on the
// first frame of the setup's first shot. They may run outside 0..1 for shots whose camera moves.
import * as THREE from "three";

export const ASPECT = 16 / 9;
export type Rect = [number, number, number, number];
export type XY = [number, number];

/** 2D rostrum transform: screen = zoom * (ref - centre), in frame widths from the frame centre, y down. */
export interface View { zoom: number; cx: number; cy: number }
export const IDENTITY: View = { zoom: 1, cx: 0, cy: 0 };
/** `outer` places a picture inside the stage picture, `inner` is a camera over that picture. */
export function compose(outer: View, inner: View): View {
  return { zoom: outer.zoom * inner.zoom, cx: outer.cx + inner.cx / outer.zoom, cy: outer.cy + inner.cy / outer.zoom };
}
export function screenToRef(v: View, x: number, y: number): XY {
  return [(x - 0.5) / v.zoom + v.cx + 0.5, ((y - 0.5) / ASPECT / v.zoom + v.cy) * ASPECT + 0.5];
}

export interface PlaceOpts {
  /** ref position of the object's origin */
  at: XY;
  /** distance from the camera along its axis, metres */
  depth: number;
  /** if given, scale the object so its bounding-box height covers this fraction of frame height */
  h?: number;
  /** uniform scale (ignored when h is given) */
  scale?: number;
  /** turn about the vertical axis, degrees; 0 faces the camera axis */
  yaw?: number;
  /** extra rotation in degrees, applied after yaw */
  rot?: [number, number, number];
}

export type Vars = Record<string, number>;
export interface FrameCtx { f: number; f0: number; view: View; vars: Vars; shot: string }
type Updater = (ctx: FrameCtx) => void;

export class Stage {
  root = new THREE.Group();
  fov = 18;
  pitch = 0; // radians, negative looks down
  background = new THREE.Color(0x8f94d8);
  /** world y of the floor, used to plant feet */
  floorY = -1.5;
  /** default values for the stage's animation variables */
  defaults: Vars = {};
  private updaters: Updater[] = [];
  private tanHalf = Math.tan(THREE.MathUtils.degToRad(9));
  private q = new THREE.Quaternion();

  constructor(public id: string) {
    this.root.name = `stage:${id}`;
  }

  /** `horizon`: ref y of the horizon line (0.5 = level camera, smaller = camera looks down, larger = up). */
  cam(o: { fov?: number; horizon?: number; bg?: number }) {
    if (o.fov) this.fov = o.fov;
    this.tanHalf = Math.tan(THREE.MathUtils.degToRad(this.fov / 2));
    if (o.horizon !== undefined) this.pitch = -Math.atan((1 - 2 * o.horizon) * this.tanHalf);
    if (o.bg !== undefined) this.background.set(o.bg);
    this.q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
    return this;
  }

  get quaternion() { return this.q; }
  get forward() { return new THREE.Vector3(0, 0, -1).applyQuaternion(this.q); }

  /** World point that shows at ref (x, y), `depth` metres along the camera axis. */
  point(x: number, y: number, depth: number): THREE.Vector3 {
    const t = this.tanHalf;
    return new THREE.Vector3((2 * x - 1) * t * ASPECT * depth, (1 - 2 * y) * t * depth, -depth).applyQuaternion(this.q);
  }
  /** World height that covers the whole frame height at `depth`. */
  span(depth: number) { return 2 * depth * this.tanHalf; }
  /** Depth at which something `worldH` tall covers `frac` of the frame height. */
  depthFor(worldH: number, frac: number) { return worldH / (2 * frac * this.tanHalf); }
  /** Ref position and depth of a world point. */
  project(p: THREE.Vector3): [number, number, number] {
    const c = p.clone().applyQuaternion(this.q.clone().invert());
    const d = -c.z;
    return [(c.x / (d * this.tanHalf * ASPECT) + 1) / 2, (1 - c.y / (d * this.tanHalf)) / 2, d];
  }

  /** Place any object by ref position and depth. */
  put<T extends THREE.Object3D>(obj: T, o: PlaceOpts, parent: THREE.Object3D = this.root): T {
    obj.position.copy(this.point(o.at[0], o.at[1], o.depth));
    obj.rotation.set(0, 0, 0);
    obj.scale.setScalar(1);
    if (o.h) {
      const box = new THREE.Box3().setFromObject(obj);
      obj.scale.setScalar((o.h * this.span(o.depth)) / Math.max(1e-6, box.max.y - box.min.y));
    } else if (o.scale) obj.scale.setScalar(o.scale);
    obj.rotation.order = "YXZ";
    const r = o.rot ?? [0, 0, 0];
    obj.rotation.set(THREE.MathUtils.degToRad(r[0]), THREE.MathUtils.degToRad((o.yaw ?? 0) + r[1]), THREE.MathUtils.degToRad(r[2]));
    if (obj.parent !== parent) parent.add(obj);
    return obj;
  }

  /** World width and height of a ref rectangle at a depth, and its centre. */
  rect(r: Rect, depth: number) {
    const w = (r[2] - r[0]) * this.span(depth) * ASPECT;
    const h = (r[3] - r[1]) * this.span(depth);
    return { w, h, centre: [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2] as XY, bottom: [(r[0] + r[2]) / 2, r[3]] as XY };
  }

  /**
   * Build a piece to fill a ref rectangle at a depth. `make(w, h)` gets the world size and must
   * return an object whose origin is the bottom centre of that w x h face.
   */
  fit<T extends THREE.Object3D>(make: (w: number, h: number) => T, r: Rect, depth: number, yaw = 0): T {
    const g = this.rect(r, depth);
    return this.put(make(g.w, g.h), { at: g.bottom, depth, yaw });
  }

  /** A flat camera-facing colour card filling a ref rectangle (default: everything). */
  card(color: number, depth: number, r: Rect = [-3, -3, 4, 4]) {
    const g = this.rect(r, depth);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(g.w, g.h), new THREE.MeshLambertMaterial({ color }));
    this.put(m, { at: g.centre, depth });
    m.quaternion.copy(this.q);
    return m;
  }

  /**
   * A horizontal floor whose far edge shows at ref y `edge` when it is `depth` metres away.
   * Sets floorY, so standing characters plant their feet on it.
   */
  floor(color: number, edge: number, depth: number, opts: { tiles?: number; line?: number } = {}) {
    const far = this.point(0.5, edge, depth);
    this.floorY = far.y;
    const size = 60;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshLambertMaterial({ color }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(0, far.y, far.z + size / 2);
    this.root.add(m);
    if (opts.tiles) {
      const pts: number[] = [];
      const n = Math.ceil(size / opts.tiles);
      for (let i = -n / 2; i <= n / 2; i++) pts.push(i * opts.tiles, 0, 0, i * opts.tiles, 0, size);
      for (let i = 0; i <= n; i++) pts.push(-size / 2, 0, i * opts.tiles, size / 2, 0, i * opts.tiles);
      const lines = new THREE.LineSegments(
        new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)),
        new THREE.LineBasicMaterial({ color: opts.line ?? 0x4a4a6a }),
      );
      lines.position.set(0, far.y + 0.003, far.z);
      this.root.add(lines);
    }
    return m;
  }

  /** Run every frame the stage is on screen: animate doors, smoke, fire from ctx.vars and ctx.f. */
  on(fn: Updater) { this.updaters.push(fn); return this; }
  update(ctx: FrameCtx) { for (const u of this.updaters) u(ctx); }
}
