// Procedural 3D character. Every joint is computed in world space from a resolved pose,
// then simple meshes are laid between the joints. The head centre is the anchor: the body
// hangs from wherever the head has to be on screen.
import * as THREE from "three";

const V = THREE.Vector3;
const Q = THREE.Quaternion;
const X = new V(1, 0, 0), Y = new V(0, 1, 0), Z = new V(0, 0, 1);
const UP = Y;

/** Head height (chin to crown, hair excluded) in metres; anchors convert a screen size to a depth with it. */
export const HEAD_H = 0.24;

export type HandShape = "open" | "fist" | "point" | "thumb" | "grip" | "flat";
export type Legs = "stand" | "sit" | "walk";

export interface RigStyle {
  skin: number; suit: number; pants: number; shirt: number; tie: number; hair: number; shoe: number;
  head: [number, number, number]; // width, height, depth
  jowl: number; // 0..1 heavy lower face
  torso: number; shoulder: number; chest: number; belly: number; hip: number; depth: number;
  upperArm: number; foreArm: number; armR: number; thigh: number; shin: number; legR: number;
  hair_style: "swoop" | "fringe";
  pocket?: number;
}

export const HOST_STYLE: RigStyle = {
  skin: 0xe9b48c, suit: 0x6f9fc4, pants: 0x6494ba, shirt: 0xb9a0dc, tie: 0xe58f7a, hair: 0x7b6a58, shoe: 0x3a3340,
  head: [0.17, HEAD_H, 0.19], jowl: 0,
  torso: 0.5, shoulder: 0.19, chest: 0.165, belly: 0.14, hip: 0.15, depth: 0.72,
  upperArm: 0.29, foreArm: 0.27, armR: 0.043, thigh: 0.44, shin: 0.44, legR: 0.06,
  hair_style: "swoop",
};
export const GUEST_STYLE: RigStyle = {
  skin: 0xd9a27c, suit: 0x27418f, pants: 0x233b84, shirt: 0xf2f2f2, tie: 0xc0202c, hair: 0xa9a59c, shoe: 0x22222a,
  head: [0.2, HEAD_H * 1.04, 0.21], jowl: 1,
  torso: 0.5, shoulder: 0.225, chest: 0.215, belly: 0.225, hip: 0.2, depth: 0.82,
  upperArm: 0.28, foreArm: 0.26, armR: 0.055, thigh: 0.4, shin: 0.41, legR: 0.075,
  hair_style: "fringe", pocket: 0xc0202c,
};

export interface RigPose {
  head: THREE.Vector3; // world head centre
  yaw: number; // world body yaw, radians; local +Z is the way the chest points
  lean: number; sway: number; // radians: forward bend, sideways bend
  headQ: THREE.Quaternion; // world head orientation
  handL: THREE.Vector3 | null; handR: THREE.Vector3 | null; // world wrist targets; null hangs at the side
  shapeL: HandShape; shapeR: HandShape;
  legs: Legs; step: number; floorY: number;
  footL: THREE.Vector3 | null; footR: THREE.Vector3 | null;
  eyes: [number, number]; lids: number; brows: [number, number];
  mouth: number; teeth: number; open: number; wide: number;
  apron: boolean; bib: boolean;
  /** size of everything below the neck relative to the head (1 = realistic adult, about 7 heads tall) */
  body: number;
  toCamera: THREE.Vector3; // unit vector from the character toward the camera, for elbow hints
}

const mats = new Map<string, THREE.Material>();
export function mat(color: number, opts: { opacity?: number; emissive?: number; side?: THREE.Side; basic?: boolean } = {}): THREE.Material {
  const key = `${color}|${opts.opacity ?? 1}|${opts.emissive ?? 0}|${opts.side ?? 0}|${opts.basic ? 1 : 0}`;
  let m = mats.get(key);
  if (!m) {
    m = opts.basic
      ? new THREE.MeshBasicMaterial({ color, transparent: (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1, side: opts.side ?? THREE.FrontSide })
      : new THREE.MeshLambertMaterial({ color, transparent: (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1, emissive: opts.emissive ?? 0, side: opts.side ?? THREE.FrontSide });
    mats.set(key, m);
  }
  return m;
}

const SPHERE = new THREE.SphereGeometry(1, 28, 20);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 18);
const BOX = new THREE.BoxGeometry(1, 1, 1);

function ball(color: number, sx: number, sy = sx, sz = sx) {
  const m = new THREE.Mesh(SPHERE, mat(color));
  m.scale.set(sx, sy, sz);
  return m;
}
function box(color: number, sx: number, sy: number, sz: number) {
  const m = new THREE.Mesh(BOX, mat(color));
  m.scale.set(sx, sy, sz);
  return m;
}
const tmpDir = new V();
function between(m: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, r: number, r2 = r) {
  tmpDir.subVectors(b, a);
  const len = Math.max(tmpDir.length(), 1e-5);
  m.position.addVectors(a, b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(Y, tmpDir.divideScalar(len));
  m.scale.set(r, len, r2);
}

/** Two-bone IK: the middle joint for a chain root -> target with bone lengths a, b, bent toward `pole`. */
function ik(root: THREE.Vector3, target: THREE.Vector3, a: number, b: number, pole: THREE.Vector3, out: { mid: THREE.Vector3; end: THREE.Vector3 }) {
  const d = new V().subVectors(target, root);
  let len = d.length();
  if (len < 1e-5) { d.set(0, -1, 0); len = 1e-5; }
  d.divideScalar(len);
  const reach = THREE.MathUtils.clamp(len, Math.abs(a - b) + 0.01, a + b - 0.004);
  const along = (a * a - b * b + reach * reach) / (2 * reach);
  const h = Math.sqrt(Math.max(0, a * a - along * along));
  const perp = pole.clone().addScaledVector(d, -pole.dot(d));
  if (perp.lengthSq() < 1e-8) perp.set(0, 0, 1).addScaledVector(d, -d.z);
  perp.normalize();
  out.mid.copy(root).addScaledVector(d, along).addScaledVector(perp, h);
  out.end.copy(root).addScaledVector(d, reach);
}

class Hand {
  group = new THREE.Group();
  /** props held in the hand attach here; +Y runs out of the palm along the fingers */
  grip = new THREE.Group();
  private palm: THREE.Mesh; private fingers: THREE.Mesh; private index: THREE.Mesh; private thumb: THREE.Mesh;
  constructor(skin: number, private side: 1 | -1, private s: number) {
    this.palm = ball(skin, 0.04 * s, 0.045 * s, 0.022 * s);
    this.palm.position.y = 0.04 * s;
    this.fingers = ball(skin, 0.036 * s, 0.04 * s, 0.02 * s);
    this.index = ball(skin, 0.012 * s, 0.04 * s, 0.012 * s);
    this.thumb = ball(skin, 0.013 * s, 0.03 * s, 0.013 * s);
    this.grip.position.set(0, 0.06 * s, 0.03 * s);
    this.group.add(this.palm, this.fingers, this.index, this.thumb, this.grip);
    this.shape("open");
  }
  shape(sh: HandShape) {
    const s = this.s, side = this.side;
    const curled = sh === "fist" || sh === "point" || sh === "thumb" || sh === "grip";
    this.fingers.position.set(0, (curled ? 0.07 : 0.095) * s, curled ? 0.018 * s : 0);
    this.fingers.scale.set(0.036 * s, (curled ? 0.026 : 0.04) * s, (curled ? 0.03 : 0.018) * s);
    this.index.visible = sh === "point";
    this.index.position.set(-side * 0.02 * s, 0.115 * s, 0);
    // the thumb sits on the inner edge of the hand (toward the body centre line)
    const up = sh === "thumb";
    this.thumb.position.set(-side * (up ? 0.03 : 0.045) * s, (up ? 0.05 : 0.055) * s, up ? 0.0 : 0.01 * s);
    this.thumb.rotation.z = up ? -side * 1.45 : -side * 0.7;
    this.thumb.scale.set(0.013 * s, (up ? 0.045 : 0.028) * s, 0.013 * s);
  }
}

export class Rig {
  group = new THREE.Group();
  handL: Hand; handR: Hand;
  headGroup = new THREE.Group();
  /** joints from the last update, world space */
  j = {
    pelvis: new V(), chest: new V(), neck: new V(),
    shL: new V(), shR: new V(), elL: new V(), elR: new V(), wrL: new V(), wrR: new V(),
    hipL: new V(), hipR: new V(), knL: new V(), knR: new V(), ftL: new V(), ftR: new V(),
  };
  bodyQ = new Q();
  private torso = new THREE.Group();
  private limbs: Record<string, THREE.Mesh> = {};
  private joints: Record<string, THREE.Mesh> = {};
  private shoeL: THREE.Mesh; private shoeR: THREE.Mesh;
  private apron!: THREE.Group; private bib!: THREE.Mesh;
  private eye: { pupil: THREE.Mesh; lid: THREE.Mesh; brow: THREE.Mesh; side: number; x: number; y: number; z: number }[] = [];
  private mouthArc!: THREE.Mesh; private mouthIn!: THREE.Mesh; private teeth!: THREE.Mesh; private jaw!: THREE.Mesh; private tongue!: THREE.Mesh;
  private neckMesh: THREE.Mesh;

  constructor(public style: RigStyle) {
    const s = style;
    this.buildTorso();
    this.group.add(this.torso);
    for (const k of ["uaL", "uaR", "faL", "faR"]) this.group.add((this.limbs[k] = new THREE.Mesh(CYL, mat(s.suit))));
    for (const k of ["thL", "thR", "snL", "snR"]) this.group.add((this.limbs[k] = new THREE.Mesh(CYL, mat(s.pants))));
    for (const k of ["shL", "shR", "elL", "elR"]) this.group.add((this.joints[k] = ball(s.suit, s.armR)));
    for (const k of ["knL", "knR", "hipL", "hipR"]) this.group.add((this.joints[k] = ball(s.pants, s.legR)));
    this.neckMesh = new THREE.Mesh(CYL, mat(s.skin));
    this.group.add(this.neckMesh);
    const hs = s.jowl ? 1.12 : 1;
    this.handL = new Hand(s.skin, 1, hs);
    this.handR = new Hand(s.skin, -1, hs);
    this.shoeL = ball(s.shoe, 0.05, 0.04, 0.12);
    this.shoeR = ball(s.shoe, 0.05, 0.04, 0.12);
    this.group.add(this.handL.group, this.handR.group, this.shoeL, this.shoeR);
    this.buildHead();
    this.group.add(this.headGroup);
  }

  private buildTorso() {
    const s = this.style;
    // lathe profile from hips to shoulders; x is half-width, flattened in z by `depth`
    const prof = [
      [s.hip * 0.72, -0.1], [s.hip, -0.03], [Math.max(s.belly, s.hip * 0.96), 0.1], [s.belly, 0.2],
      [s.chest, 0.36], [s.shoulder * 0.95, 0.45], [s.shoulder * 0.7, 0.5], [0.055, 0.53],
    ].map(([r, y]) => new THREE.Vector2(r!, (y! / 0.5) * s.torso));
    const jacket = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), mat(s.suit));
    jacket.scale.z = s.depth;
    this.torso.add(jacket);
    const front = s.chest * s.depth;
    // shirt and tie: flattened blobs poking out of the chest
    const sm = ball(s.shirt, 0.05, 0.13, front * 0.5);
    sm.position.set(0, s.torso * 0.88, front * 0.36);
    sm.rotation.x = -0.2;
    const tm = ball(s.tie, 0.02, 0.115, front * 0.5);
    tm.position.set(0, s.torso * 0.86, front * 0.4);
    tm.rotation.x = -0.2;
    const knot = ball(s.tie, 0.022, 0.02, 0.02);
    knot.position.set(0, s.torso * 1.03, front * 0.42);
    this.torso.add(sm, tm, knot);
    if (s.pocket) {
      const p = box(s.pocket, 0.045, 0.014, 0.01);
      p.position.set(0.1, s.torso * 0.74, front * 0.86);
      this.torso.add(p);
    }
    // apron: bib and skirt hanging in front
    this.apron = new THREE.Group();
    const white = mat(0xf4f1ea, { side: THREE.DoubleSide });
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(s.hip * 1.12, s.hip * 1.25, 0.5, 20, 1, true, -1.25, 2.5), white);
    skirt.position.y = -0.03; skirt.scale.z = s.depth * 1.08;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(s.chest * 0.8, s.belly * 1.1, 0.26, 16, 1, true, -0.75, 1.5), white);
    top.position.y = 0.32; top.scale.z = s.depth * 1.12;
    this.apron.add(skirt, top);
    this.torso.add(this.apron);
    // napkin tucked into the collar
    this.bib = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xf6f4ee, { side: THREE.DoubleSide }));
    this.bib.scale.set(0.085, 0.3, 0.05);
    this.bib.rotation.x = Math.PI;
    this.bib.position.set(0, s.torso * 1.02, front * 0.86);
    this.torso.add(this.bib);
  }

  private buildHead() {
    const s = this.style;
    const [w, h, d] = s.head;
    const g = this.headGroup;
    const skull = ball(s.skin, w / 2, h / 2, d / 2);
    g.add(skull);
    this.jaw = ball(s.skin, w * (0.37 + 0.09 * s.jowl), h * 0.27, d * (0.4 + 0.05 * s.jowl));
    this.jaw.position.set(0, -h * 0.24, d * 0.07);
    g.add(this.jaw);
    for (const side of [1, -1]) {
      const ear = ball(s.skin, 0.012, 0.03, 0.02);
      ear.position.set(side * w * 0.5, -0.005, -d * 0.05);
      g.add(ear);
    }
    const nose = ball(s.skin, 0.02, 0.022, 0.03 + 0.008 * s.jowl);
    nose.position.set(0, -h * 0.07, d * 0.5);
    g.add(nose);
    if (s.hair_style === "swoop") {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.46), mat(s.hair));
      cap.scale.set(w * 0.54, h * 0.56, d * 0.56);
      cap.rotation.x = -0.45;
      cap.position.set(0, 0.008, -0.004);
      const quiff = ball(s.hair, w * 0.4, 0.028, 0.07);
      quiff.position.set(0.012, h * 0.44, d * 0.3);
      quiff.rotation.x = 0.5;
      const side1 = ball(s.hair, 0.014, 0.05, 0.05), side2 = ball(s.hair, 0.014, 0.05, 0.05);
      side1.position.set(w * 0.49, h * 0.16, -d * 0.1); side2.position.set(-w * 0.49, h * 0.16, -d * 0.1);
      g.add(cap, quiff, side1, side2);
    } else {
      const fringe = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 8, Math.PI * 0.95, Math.PI * 1.1, Math.PI * 0.42, Math.PI * 0.3), mat(s.hair));
      fringe.scale.set(w * 0.525, h * 0.52, d * 0.535);
      g.add(fringe);
    }
    const ez = d * 0.4, ey = h * 0.1, ex = w * 0.21, er = 0.031;
    for (const side of [1, -1]) {
      const white = ball(0xffffff, er, er, er * 0.8);
      white.position.set(side * ex, ey, ez);
      const pupil = ball(0x16161c, 0.0105, 0.0105, 0.005);
      const lid = new THREE.Mesh(new THREE.SphereGeometry(er * 1.07, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(s.skin, { side: THREE.DoubleSide }));
      lid.position.copy(white.position);
      lid.scale.z = 0.8;
      const brow = box(s.jowl ? 0x6f6c68 : 0x4f4338, 0.056, 0.011, 0.016);
      g.add(white, pupil, lid, brow);
      this.eye.push({ pupil, lid, brow, side, x: side * ex, y: ey, z: ez });
    }
    // mouth: a curved line when shut, a dark opening with teeth when open
    const my = -h * 0.3, mz = d * (0.45 + 0.04 * s.jowl);
    const R = 0.05, arc = 1.3;
    this.mouthArc = new THREE.Mesh(new THREE.TorusGeometry(R, 0.0045, 6, 20, arc), mat(0x4a1f1c));
    this.mouthArc.geometry.rotateZ(-Math.PI / 2 - arc / 2);
    this.mouthArc.geometry.translate(0, R, 0);
    this.mouthArc.position.set(0, my, mz);
    this.mouthIn = ball(0x3a1414, 1, 1, 1);
    this.mouthIn.position.set(0, my, mz - 0.006);
    this.teeth = box(0xfafafa, 1, 1, 1);
    this.tongue = ball(0xc45a5a, 1, 1, 1);
    g.add(this.mouthArc, this.mouthIn, this.teeth, this.tongue);
  }

  update(p: RigPose) {
    const b = p.body, o = this.style, j = this.j;
    const s = { ...o, torso: o.torso * b, shoulder: o.shoulder * b, hip: o.hip * b, upperArm: o.upperArm * b, foreArm: o.foreArm * b, armR: o.armR * b, thigh: o.thigh * b, shin: o.shin * b, legR: o.legR * b };
    this.torso.scale.setScalar(b);
    const yawQ = new Q().setFromAxisAngle(Y, p.yaw);
    const bodyQ = this.bodyQ.copy(yawQ).multiply(new Q().setFromAxisAngle(X, p.lean)).multiply(new Q().setFromAxisAngle(Z, p.sway));
    const bx = new V(1, 0, 0).applyQuaternion(bodyQ), by = new V(0, 1, 0).applyQuaternion(bodyQ), bz = new V(0, 0, 1).applyQuaternion(bodyQ);
    const fwd = new V(0, 0, 1).applyQuaternion(yawQ), left = new V(1, 0, 0).applyQuaternion(yawQ);
    const h = s.head[1];
    // head -> neck -> chest -> pelvis
    this.headGroup.position.copy(p.head);
    this.headGroup.quaternion.copy(p.headQ);
    const skullBase = new V(0, -h * 0.42, -s.head[2] * 0.08).applyQuaternion(p.headQ).add(p.head);
    j.neck.copy(skullBase);
    j.chest.copy(skullBase).addScaledVector(by, -0.07 * b).addScaledVector(bz, -0.01);
    j.pelvis.copy(j.chest).addScaledVector(by, -s.torso);
    this.torso.position.copy(j.pelvis);
    this.torso.quaternion.copy(bodyQ);
    between(this.neckMesh, j.chest.clone().addScaledVector(by, -0.03), skullBase.clone().addScaledVector(by, 0.03), 0.045 + 0.012 * s.jowl);
    this.apron.visible = p.apron;
    this.bib.visible = p.bib;

    // arms
    for (const side of [1, -1] as const) {
      const L = side === 1;
      const sh = L ? j.shL : j.shR, el = L ? j.elL : j.elR, wr = L ? j.wrL : j.wrR;
      sh.copy(j.chest).addScaledVector(bx, side * (s.shoulder - 0.015 * b)).addScaledVector(by, -0.075 * b);
      const target = (L ? p.handL : p.handR) ?? sh.clone().addScaledVector(by, -(s.upperArm + s.foreArm) * 0.97).addScaledVector(bx, side * 0.05).addScaledVector(bz, 0.04);
      const pole = new V().addScaledVector(UP, -1).addScaledVector(left, side * 0.7).addScaledVector(fwd, -0.5);
      ik(sh, target, s.upperArm, s.foreArm, pole, { mid: el, end: wr });
      between(this.limbs[L ? "uaL" : "uaR"]!, sh, el, s.armR * 1.08, s.armR * 1.08);
      between(this.limbs[L ? "faL" : "faR"]!, el, wr, s.armR * 0.95, s.armR * 0.95);
      this.joints[L ? "shL" : "shR"]!.position.copy(sh);
      this.joints[L ? "shL" : "shR"]!.scale.setScalar(s.armR * 1.15);
      this.joints[L ? "elL" : "elR"]!.position.copy(el);
      this.joints[L ? "elL" : "elR"]!.scale.setScalar(s.armR);
      const hand = L ? this.handL : this.handR;
      const shape = L ? p.shapeL : p.shapeR;
      hand.shape(shape);
      // hand: +Y along the forearm, palm normal (+Z) toward the camera as far as possible, thumb up for a thumbs-up
      const dir = new V().subVectors(wr, el).normalize();
      let zAxis = (shape === "thumb" ? new V().crossVectors(UP, dir).multiplyScalar(-side) : p.toCamera.clone());
      zAxis.addScaledVector(dir, -zAxis.dot(dir));
      if (zAxis.lengthSq() < 1e-6) zAxis = new V().crossVectors(left, dir);
      zAxis.normalize();
      const xAxis = new V().crossVectors(dir, zAxis);
      hand.group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, dir, zAxis));
      hand.group.position.copy(wr);
    }

    // legs
    const legLen = s.thigh + s.shin;
    for (const side of [1, -1] as const) {
      const L = side === 1;
      const hip = L ? j.hipL : j.hipR, kn = L ? j.knL : j.knR, ft = L ? j.ftL : j.ftR;
      hip.copy(j.pelvis).addScaledVector(bx, side * s.hip * 0.5).addScaledVector(by, -0.04);
      let target: THREE.Vector3;
      const given = L ? p.footL : p.footR;
      let pole = fwd.clone();
      if (given) target = given;
      else if (p.legs === "sit") {
        target = hip.clone().addScaledVector(fwd, s.thigh * 0.98).addScaledVector(left, side * 0.03);
        target.y = Math.max(p.floorY + 0.06, hip.y - s.shin * 0.99);
        pole = fwd.clone().addScaledVector(UP, 1.5);
      } else {
        const ankleY = p.floorY + 0.06;
        const drop = hip.y - ankleY;
        let stride = 0;
        let lift = 0;
        if (p.legs === "walk") {
          const ph = (p.step + (L ? 0 : 1)) * Math.PI;
          stride = Math.sin(ph) * 0.26;
          lift = Math.max(0, Math.cos(ph)) * 0.09;
        }
        target = new V(hip.x, 0, hip.z).addScaledVector(fwd, stride).addScaledVector(left, side * 0.02);
        target.y = drop > 0.2 && drop < legLen * 1.15 ? ankleY + lift : hip.y - legLen * 0.995;
      }
      ik(hip, target, s.thigh, s.shin, pole, { mid: kn, end: ft });
      between(this.limbs[L ? "thL" : "thR"]!, hip, kn, s.legR * 1.1, s.legR * 1.1);
      between(this.limbs[L ? "snL" : "snR"]!, kn, ft, s.legR * 0.85, s.legR * 0.85);
      this.joints[L ? "knL" : "knR"]!.position.copy(kn);
      this.joints[L ? "knL" : "knR"]!.scale.setScalar(s.legR);
      this.joints[L ? "hipL" : "hipR"]!.scale.setScalar(s.legR);
      this.joints[L ? "hipL" : "hipR"]!.position.copy(hip);
      const shoe = L ? this.shoeL : this.shoeR;
      shoe.position.copy(ft).addScaledVector(fwd, 0.05).addScaledVector(UP, -0.03);
      shoe.quaternion.copy(yawQ);
    }

    this.face(p);
  }

  private face(p: RigPose) {
    const s = this.style;
    const [, h, d] = s.head;
    const lids = THREE.MathUtils.clamp(p.lids, 0, 1);
    for (const e of this.eye) {
      const gx = THREE.MathUtils.clamp(p.eyes[0], -1, 1), gy = THREE.MathUtils.clamp(p.eyes[1], -1, 1);
      // camera-right is the character's -X when they face the camera
      e.pupil.position.set(e.x - gx * 0.015, e.y + gy * 0.013, e.z + 0.0235 - (gx * gx + gy * gy) * 0.006);
      e.lid.rotation.x = THREE.MathUtils.lerp(-0.75, Math.PI / 2 - 0.05, lids);
      e.brow.position.set(e.x, e.y + 0.043 + p.brows[0] * 0.014 - lids * 0.004, e.z + 0.004);
      e.brow.rotation.z = -e.side * p.brows[1] * 0.5;
    }
    const open = THREE.MathUtils.clamp(p.open, 0, 1.2);
    const my = -h * 0.3, mz = d * (0.45 + 0.04 * s.jowl);
    const width = 0.034 * p.wide;
    const isOpen = open > 0.04;
    const grin = p.teeth > 0.5;
    this.mouthArc.visible = !isOpen && !grin;
    const mood = Math.abs(p.mouth) < 0.08 ? 0.08 : p.mouth;
    this.mouthArc.scale.set(0.75, mood * 0.7, 1);
    this.mouthIn.visible = isOpen || grin;
    const oh = grin && !isOpen ? 0.011 : 0.006 + open * 0.028;
    this.mouthIn.scale.set(grin && !isOpen ? 0.036 : width, oh, 0.014);
    this.mouthIn.position.set(0, my - oh * 0.6 + 0.004, mz - 0.008);
    this.teeth.visible = grin || open > 0.25;
    this.teeth.scale.set((grin && !isOpen ? 0.062 : width * 1.5), grin && !isOpen ? 0.013 : 0.007, 0.006);
    this.teeth.position.set(0, my + 0.002 - (grin && !isOpen ? oh * 0.6 - 0.002 : 0.004), mz + 0.004);
    this.tongue.visible = open > 0.45;
    this.tongue.scale.set(width * 0.6, 0.006, 0.006);
    this.tongue.position.set(0, my - oh * 1.25, mz + 0.004);
    this.jaw.position.y = -h * 0.24 - open * 0.024;
  }
}
