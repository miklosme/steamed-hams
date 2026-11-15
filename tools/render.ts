// Render the whole animation (or a frame range) to an MP4 with the original audio.
//
//   bun tools/render.ts [OUT.mp4] [--width 1920] [--from F] [--to F] [--crf 16]
//
// Frames are drawn one by one from the frame number, so the result is frame-exact at 24000/1001 fps
// whatever the machine's speed. The audio is cut from the source clip to the same range.
import { open } from "./browser";

const args = process.argv.slice(2);
const flag = (name: string, dflt: number) => { const i = args.indexOf(name); if (i < 0) return dflt; const v = Number(args[i + 1]); args.splice(i, 2); return v; };
const width = flag("--width", 1920), crf = flag("--crf", 16);
const timeline = await Bun.file(new URL("../timeline/timeline.json", import.meta.url)).json();
const from = flag("--from", 0), to = flag("--to", timeline.source.frames);
const out = args[0] ?? "out/animation.mp4";
const src = new URL(`../${timeline.source.file}`, import.meta.url).pathname.replace(/%20/g, " ").replace(/%5B/g, "[").replace(/%5D/g, "]");
const FPS = "24000/1001", t0 = (from * 1001) / 24000, dur = ((to - from) * 1001) / 24000;

const { page, close } = await open(width);
const ff = Bun.spawn([
  "ffmpeg", "-v", "error", "-y",
  "-f", "image2pipe", "-framerate", FPS, "-c:v", "mjpeg", "-i", "-",
  "-ss", t0.toFixed(4), "-t", dur.toFixed(4), "-i", src,
  "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "medium", "-crf", String(crf), "-pix_fmt", "yuv420p",
  "-r", FPS, "-frames:v", String(to - from), "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out,
], { stdin: "pipe", stdout: "inherit", stderr: "inherit" });

const started = Date.now();
for (let f = from; f < to; f++) {
  const url: string = await page.evaluate((n) => (window as any).stage.frame(n, "image/jpeg", 0.95), f);
  ff.stdin.write(Buffer.from(url.slice(url.indexOf(",") + 1), "base64"));
  if ((f - from) % 200 === 0) { await ff.stdin.flush(); console.log(`frame ${f} / ${to}  (${(((f - from + 1) / (Date.now() - started)) * 1000).toFixed(1)} fps)`); }
}
await ff.stdin.end();
const code = await ff.exited;
await close();
console.log(code === 0 ? `${out}: ${to - from} frames` : `ffmpeg failed (${code})`);
process.exit(code);
