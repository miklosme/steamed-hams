// Chrome-less page for scripted capture (tools/shoot.ts, tools/render.ts): no clock, no audio.
// `await stage.ready`, then `stage.frame(n)` draws frame n and returns it as a data URL.
import { Engine } from "./engine";
import { loadTimeline } from "./timeline";

const q = new URLSearchParams(location.search);
const w = Number(q.get("w") ?? 1920), h = Math.round((w * 9) / 16);
const canvas = document.getElementById("gl") as HTMLCanvasElement;

const ready = (async () => {
  const tl = await loadTimeline();
  const engine = new Engine(canvas, tl);
  engine.renderer.setPixelRatio(1);
  engine.setSize(w, h);
  const draw = (n: number) => engine.render(n);
  const frame = (n: number, type = "image/jpeg", quality = 0.92) => { draw(n); return canvas.toDataURL(type, quality); };
  /** Side-by-side sheet: reference frame on the left, render on the right, one row per frame. */
  const sheet = async (frames: number[], cols = 2, tile = 480) => {
    const th = Math.round((tile * 9) / 16);
    const rows = Math.ceil(frames.length / cols);
    const out = document.createElement("canvas");
    out.width = cols * tile * 2; out.height = rows * th;
    const c = out.getContext("2d")!;
    const notes: string[] = [];
    for (const [k, n] of frames.entries()) {
      const x = (k % cols) * tile * 2, y = Math.floor(k / cols) * th;
      const img = new Image();
      img.src = `/frames/${String(n).padStart(5, "0")}.jpg`;
      await img.decode().catch(() => {});
      if (img.naturalWidth) c.drawImage(img, x, y, tile, th);
      draw(n);
      c.drawImage(canvas, x + tile, y, tile, th);
      c.fillStyle = "#000"; c.fillRect(x, y, 86, 18);
      c.fillStyle = "#fff"; c.font = "13px monospace"; c.fillText(`${engine.current?.shot.id} ${n}`, x + 3, y + 13);
      notes.push(`${n}: ${Object.entries(engine.depths).map(([k, v]) => `${k} head at ${v} m`).join(", ") || "nobody"}`);
      c.strokeStyle = "#000"; c.strokeRect(x + 0.5, y + 0.5, tile * 2 - 1, th - 1);
    }
    return { url: out.toDataURL("image/jpeg", 0.85), notes };
  };
  return { tl, engine, draw, frame, sheet };
})();

Object.assign(window, { stage: { ready, frame: async (n: number, t?: string, qy?: number) => (await ready).frame(n, t, qy), sheet: async (fr: number[], cols?: number, tile?: number) => (await ready).sheet(fr, cols, tile) } });
