// Takes the home-page preview screenshot for an exploration.
//
//   node scripts/preview.mjs <slug> [selector]
//
// Opens <slug>/index.html in headless Chrome (no server needed) and saves a 2x PNG
// of the element matching <selector> (default: .widget-frame, or the whole viewport if not found)
// to <slug>/preview.png.
// Requires Node 22+ and Google Chrome. Set CHROME_PATH if Chrome is not in the default macOS location.

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const [slug, selector = ".widget-frame"] = process.argv.slice(2);
if (!slug) {
  console.error("Usage: node scripts/preview.mjs <slug> [selector]");
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const page = join(root, slug, "index.html");
const out = join(root, slug, "preview.png");
if (!existsSync(page)) {
  console.error(`Not found: ${page}`);
  process.exit(1);
}

const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9333;
const profile = mkdtempSync(join(tmpdir(), "preview-chrome-"));
const chrome = spawn(chromePath, [
  "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cleanup = async () => {
  const exited = new Promise((r) => chrome.once("exit", r));
  chrome.kill();
  await Promise.race([exited, sleep(3000)]);
  try { rmSync(profile, { recursive: true, force: true, maxRetries: 3 }); } catch {}
};

try {
  let target;
  for (let i = 0; i < 50 && !target; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = list.find((t) => t.type === "page");
    } catch {}
    if (!target) await sleep(200);
  }
  if (!target) throw new Error("Could not start Chrome. Set CHROME_PATH to your Chrome binary.");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.addEventListener("open", r); ws.addEventListener("error", j); });
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (!pending.has(m.id)) return;
    pending.get(m.id)(m);
    pending.delete(m.id);
  });
  const send = (method, params = {}) => new Promise((r, j) => {
    const i = ++id;
    pending.set(i, (m) => (m.error ? j(new Error(`${method}: ${m.error.message}`)) : r(m.result)));
    ws.send(JSON.stringify({ id: i, method, params }));
  });

  // Large viewport so the phone frame renders at its full 360px size, not scaled down.
  await send("Emulation.setDeviceMetricsOverride", { width: 1400, height: 1100, deviceScaleFactor: 2, mobile: false });
  await send("Page.navigate", { url: pathToFileURL(page).href });
  await sleep(2500); // let fonts and images load
  // Snap anything mid-animation to its resting state so the shot is consistent.
  await send("Runtime.evaluate", { expression: `(() => {
    const s = document.createElement("style");
    s.textContent = "*, *::before, *::after { animation: none !important; transition: none !important; }";
    document.head.append(s);
  })()` });
  await sleep(200);

  const { result } = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: b.x, y: b.y, width: b.width, height: b.height };
    })()`,
  });
  const rect = result.value;
  if (!rect) console.warn(`No element matches "${selector}", capturing the viewport instead.`);

  const shot = await send("Page.captureScreenshot", { format: "png", ...(rect && { clip: { ...rect, scale: 1 } }) });
  writeFileSync(out, Buffer.from(shot.data, "base64"));
  console.log(`Saved ${out}`);
  ws.close();
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await cleanup();
}
