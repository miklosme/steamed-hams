// Static server for the player, the bare render page, the timeline data and the media files.
import { join, normalize } from "node:path";
import page from "./index.html";
import bare from "./bare.html";

const root = import.meta.dir;
// /frames/ is the reference frame cache (see timeline/README.md), used by the comparison tools.
const STATIC: Record<string, string> = { "/timeline/": "timeline", "/media/": "media", "/frames/": ".cache/frames" };

export function serve(port: number) {
  return Bun.serve({
    port,
    development: true,
    routes: { "/": page, "/bare": bare },
    async fetch(req) {
      const path = decodeURIComponent(new URL(req.url).pathname);
      const prefix = Object.keys(STATIC).find((p) => path.startsWith(p));
      if (!prefix || normalize(path) !== path) return new Response("not found", { status: 404 });
      const file = Bun.file(join(root, STATIC[prefix]!, path.slice(prefix.length)));
      if (!(await file.exists())) return new Response("not found", { status: 404 });
      const headers: Record<string, string> = { "Accept-Ranges": "bytes", "Content-Type": file.type };
      // Timeline files change while you work; never serve a stale one.
      if (path.startsWith("/timeline/")) headers["Cache-Control"] = "no-store";
      // Media seeking needs byte ranges.
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
}
