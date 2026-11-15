// Timeline player. The reference clip is the master clock and supplies the original audio;
// the three.js animation is drawn for whatever frame the clip is on, so sound and picture
// cannot drift. The clip itself is hidden unless you raise its opacity to compare.
import { Engine } from "./engine";
import { FPS, loadTimeline } from "./timeline";
import type { Shot, Timeline } from "./timeline";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
// `video` is the clock: the original soundtrack as AAC, which every browser plays (the source's
// Opus-in-MP4 does not play everywhere). `overlay` is the reference picture, muted, kept in step with it.
const video = $<HTMLAudioElement>("clock");
const overlay = $<HTMLVideoElement>("ref");
const canvas = $<HTMLCanvasElement>("gl");
// Set here, not in the HTML: the bundler would copy the files and serve them without byte ranges, which breaks seeking.
video.src = "/media/audio.m4a";
overlay.src = "/media/ref.mp4";
overlay.muted = true;

/** Keep the reference picture on the clock's frame, but only while it is visible. */
function syncOverlay() {
  if (Number(overlay.style.opacity || 0) === 0) { if (!overlay.paused) overlay.pause(); return; }
  if (Math.abs(overlay.currentTime - video.currentTime) > (video.paused ? 0.001 : 0.08)) overlay.currentTime = video.currentTime;
  if (video.paused !== overlay.paused) video.paused ? overlay.pause() : void overlay.play().catch(() => {});
}

const WHO_COLOUR: Record<string, number> = { host: 0x6f9fc4, guest: 0x27418f, mother: 0xb06a9a, chorus: 0xd9a25a };

let tl: Timeline;
let engine: Engine;
let frame = -1;
let shot: Shot | undefined;

function draw(f: number) {
  frame = f;
  engine.render(f);
  shot = engine.current!.shot;
  hud(f, shot, f / FPS);
}

// ---------------------------------------------------------------- panel

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
let hudShot = "";

function hud(f: number, s: Shot, t: number) {
  $("readout").textContent = `${s.id}  frame ${f}  (+${f - s.f0}/${s.f1 - s.f0})  ${t.toFixed(3)}s`;
  ($("scrub").querySelector("b") as HTMLElement).style.left = `${(f / tl.frames) * 100}%`;
  if (hudShot !== s.id) {
    hudShot = s.id;
    const cast = (s.cast ?? []).map((c) => `${c.who}: ${c.visible}, ${c.screen}, facing ${c.facing}`).join("<br>");
    $("shot").innerHTML =
      `${esc(s.summary ?? "")}<br><span style="color:var(--dim)">${esc(s.framing ?? "")}<br>` +
      `set ${s.set} · setup ${s.setup} · camera ${s.camera.static ? "static" : "moves"}<br>${cast}</span>`;
    $("beats").innerHTML = (s.beats ?? [])
      .map((b) => `<div class="beat" data-f="${b.f}"><b>${b.f}</b> ${esc(b.who)}: ${esc(b.action)}</div>`)
      .join("");
  }
  let lastOn: Element | undefined;
  for (const el of $("beats").children) {
    const on = Number((el as HTMLElement).dataset.f) <= f;
    el.classList.toggle("on", on);
    if (on) lastOn = el;
  }
  if (!video.paused) lastOn?.scrollIntoView({ block: "nearest" });
  const now = tl.lines.filter((l) => t >= l.t0 - 0.2 && t < l.t1 + 0.4);
  $("line").innerHTML = now
    .map((l) => {
      const words = l.words
        ? l.words.map((w) => `<span class="word${t >= w.t0 && t < w.t1 ? " on" : ""}">${esc(w.w)}</span>`).join(" ")
        : esc(l.text);
      return `<div><span style="color:var(--dim)">${l.id} ${l.who}:</span> ${words}</div>`;
    })
    .join("") || '<span style="color:var(--dim)">(none)</span>';
}

// ---------------------------------------------------------------- transport

const frameOfTime = (t: number) => Math.min(tl.frames - 1, Math.max(0, Math.floor(t * FPS + 1e-3)));

function seekFrame(f: number): Promise<void> {
  f = Math.min(tl.frames - 1, Math.max(0, Math.round(f)));
  return new Promise((resolve) => {
    video.addEventListener("seeked", () => { draw(f); resolve(); }, { once: true });
    video.currentTime = (f + 0.5) / FPS; // aim at the middle of the frame so rounding cannot slip to a neighbour
  });
}

function tick() {
  const f = frameOfTime(video.currentTime);
  if (f !== frame && !video.seeking) draw(f);
  syncOverlay();
  requestAnimationFrame(tick);
}

function resize() {
  const r = canvas.parentElement!.getBoundingClientRect();
  engine.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  engine.setSize(r.width, r.height);
  draw(Math.max(frame, 0));
}

async function main() {
  tl = await loadTimeline();
  engine = new Engine(canvas, tl);
  const scrub = $("scrub");
  for (const s of tl.shots) {
    const i = document.createElement("i");
    i.style.left = `${(s.f0 / tl.frames) * 100}%`;
    scrub.append(i);
  }
  for (const l of tl.lines) {
    const sp = document.createElement("span");
    sp.style.left = `${(l.f0 / tl.frames) * 100}%`;
    sp.style.width = `${(Math.max(1, l.f1 - l.f0) / tl.frames) * 100}%`;
    sp.style.background = `#${(WHO_COLOUR[l.who] ?? 0x777777).toString(16).padStart(6, "0")}`;
    scrub.append(sp);
  }
  const scrubTo = (e: MouseEvent) => {
    const r = scrub.getBoundingClientRect();
    void seekFrame(((e.clientX - r.left) / r.width) * tl.frames);
  };
  scrub.addEventListener("mousedown", (e) => {
    scrubTo(e);
    const move = (ev: MouseEvent) => scrubTo(ev);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", () => window.removeEventListener("mousemove", move), { once: true });
  });

  const toggle = () => {
    if (!video.paused) return video.pause();
    video.play().catch((err) => ($("readout").textContent = `cannot play the soundtrack: ${err}`));
  };
  video.addEventListener("error", () => ($("readout").textContent = "media/audio.m4a did not load: run `bun run proxy`"));
  const step = (d: number) => { video.pause(); void seekFrame(frame + d); };
  const stepShot = (d: number) => {
    video.pause();
    const i = tl.shots.indexOf(shot!);
    const target = d < 0 && frame > shot!.f0 ? shot! : tl.shots[Math.min(tl.shots.length - 1, Math.max(0, i + d))]!;
    void seekFrame(target.f0);
  };
  $("play").onclick = toggle;
  $("prev").onclick = () => step(-1);
  $("next").onclick = () => step(1);
  $("prevShot").onclick = () => stepShot(-1);
  $("nextShot").onclick = () => stepShot(1);
  video.addEventListener("play", () => ($("play").textContent = "Pause"));
  video.addEventListener("pause", () => ($("play").textContent = "Play"));
  const opacity = $<HTMLInputElement>("opacity");
  const setOpacity = () => { overlay.style.opacity = opacity.value; syncOverlay(); };
  opacity.oninput = setOpacity;
  $<HTMLInputElement>("volume").oninput = (e) => (video.volume = Number((e.target as HTMLInputElement).value));
  setOpacity();
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") { e.preventDefault(); toggle(); }
    else if (e.code === "ArrowLeft") { e.preventDefault(); e.shiftKey ? stepShot(-1) : step(-1); }
    else if (e.code === "ArrowRight") { e.preventDefault(); e.shiftKey ? stepShot(1) : step(1); }
    else if (e.key === "o") { opacity.value = opacity.value === "0" ? "0.5" : opacity.value === "0.5" ? "1" : "0"; setOpacity(); }
  });
  window.addEventListener("resize", resize);
  resize();
  const start = Number(new URLSearchParams(location.search).get("frame") ?? 0);
  await (video.readyState >= 1 ? Promise.resolve() : new Promise((r) => video.addEventListener("loadedmetadata", r, { once: true })));
  await seekFrame(start);
  requestAnimationFrame(tick);
  // for scripted capture: await player.seekFrame(n), then read the canvas
  Object.assign(window, { player: { seekFrame, get frame() { return frame; }, timeline: tl } });
}

main().catch((err) => { $("readout").textContent = String(err); console.error(err); });
