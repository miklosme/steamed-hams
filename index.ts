// Dev server: the player page, plus the timeline data and the reference proxy as static files.
import { join, normalize } from "node:path";
import page from "./index.html";

const root = import.meta.dir;
const STATIC = ["/timeline/", "/media/"];

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  development: true,
  routes: { "/": page },
  async fetch(req) {
    const path = decodeURIComponent(new URL(req.url).pathname);
    if (!STATIC.some((p) => path.startsWith(p)) || normalize(path) !== path) {
      return new Response("not found", { status: 404 });
    }
    const file = Bun.file(join(root, path));
    if (!(await file.exists())) return new Response("not found", { status: 404 });
    const headers: Record<string, string> = {
      "Accept-Ranges": "bytes",
      "Content-Type": file.type,
    };
    // Timeline files change while you work; never serve a stale one.
    if (path.startsWith("/timeline/")) headers["Cache-Control"] = "no-store";
    // Video seeking needs byte ranges.
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), file.size - 1) : file.size - 1;
      if (start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${file.size}` } });
      headers["Content-Range"] = `bytes ${start}-${end}/${file.size}`;
      headers["Content-Length"] = String(end - start + 1);
      return new Response(file.slice(start, end + 1), { status: 206, headers });
    }
    return new Response(file, { headers });
  },
});

console.log(`player: ${server.url}`);
