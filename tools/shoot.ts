// Compare the animation with the reference: writes a sheet of [reference | render] pairs.
//
//   bun tools/shoot.ts OUT.jpg S25            8 frames spread over shot S25
//   bun tools/shoot.ts OUT.jpg S25 12         12 frames
//   bun tools/shoot.ts OUT.jpg 1945 1960 3    frames 1945..1960, every 3rd
//   bun tools/shoot.ts OUT.jpg 1945,1977      exactly these frames
//   --cols N (pairs per row, default 2)   --tile PX (width of one picture, default 480)
//   --solo  render only, one frame, full size (first frame given)
//
// Needs the reference frame cache (.cache/frames, see timeline/README.md). Write sheets to a scratch directory.
import { open } from "./browser";

const args = process.argv.slice(2);
const flag = (name: string, dflt: number) => { const i = args.indexOf(name); if (i < 0) return dflt; const v = Number(args[i + 1]); args.splice(i, 2); return v; };
const cols = flag("--cols", 2), tile = flag("--tile", 480);
const soloAt = args.indexOf("--solo");
const solo = soloAt >= 0;
if (solo) args.splice(soloAt, 1);
const [out, a, b, c] = args;
if (!out || !a) { console.error("usage: bun tools/shoot.ts OUT.jpg (Sxx [count] | start end [step] | f,f,f) [--cols N] [--tile PX] [--solo]"); process.exit(1); }

const timeline = await Bun.file(new URL("../timeline/timeline.json", import.meta.url)).json();
let frames: number[];
if (/^S\d+$/.test(a)) {
  const s = timeline.shots.find((x: { id: string }) => x.id === a);
  if (!s) throw new Error(`no shot ${a}`);
  const n = Math.min(Number(b ?? 8), s.f1 - s.f0);
  frames = Array.from({ length: n }, (_, i) => Math.round(s.f0 + (i * (s.f1 - 1 - s.f0)) / Math.max(1, n - 1)));
} else if (a.includes(",")) frames = a.split(",").map(Number);
else if (b) { frames = []; for (let f = Number(a); f <= Number(b); f += Number(c ?? 1)) frames.push(f); }
else frames = [Number(a)];

const { page, close } = await open(solo ? 1280 : tile);
let url: string;
if (solo) url = await page.evaluate((f) => (window as any).stage.frame(f), frames[0]!);
else {
  const r: { url: string; notes: string[] } = await page.evaluate((fr, co, ti) => (window as any).stage.sheet(fr, co, ti), frames, cols, tile);
  url = r.url;
  console.log(r.notes.join("\n")); // how far each head is from the camera: set pieces go in front of or behind that
}
await Bun.write(out, Buffer.from(url.split(",")[1]!, "base64"));
console.log(`${out}: ${solo ? `frame ${frames[0]}` : `${frames.length} frames (${frames[0]}..${frames.at(-1)})`}`);
await close();
