// Headless Chrome on the bare render page, with its own server on a free port.
import puppeteer from "puppeteer-core";
import { serve } from "../server";

const CHROME = process.env.CHROME ?? ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find((p) => Bun.file(p).size > 0);

export async function open(width: number) {
  if (!CHROME) throw new Error("no Chrome found; set CHROME=/path/to/chrome");
  const server = serve(0);
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: true,
    args: ["--no-sandbox", ...(process.env.GLARGS ?? "--use-angle=swiftshader --enable-unsafe-swiftshader").split(" ")],
  });
  const page = await browser.newPage();
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warn") console.error(`[page] ${m.text()}`); });
  page.on("pageerror", (e) => console.error(`[page] ${e}`));
  await page.goto(`http://localhost:${server.port}/bare?w=${width}`, { waitUntil: "load" });
  await page.evaluate(() => (window as any).stage.ready.then(() => true));
  return { page, browser, server, close: async () => { await browser.close(); await server.stop(true); } };
}
