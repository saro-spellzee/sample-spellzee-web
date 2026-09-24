#!/usr/bin/env node
// Screenshots the original x-dc export and the converted Next.js route,
// landmark by landmark (header / section / footer, in DOM order), at several
// viewport widths, and writes side-by-side pair images plus a height report.
//
// Usage:
//   node capture.mjs --original screens/<screen>/Main.dc.html \
//                    --url http://localhost:3000/<route> \
//                    --out <dir> [--widths 1440,1000,390] [--motion] [--only original|converted]
//                    [--states tests/design-states/<screen>.json]
//
// --original may also be the folder screens/<screen>. When the screen has more than one
// design board (a mobile or tablet board next to the desktop one, see boards.mjs), each
// width is compared with the board drawn nearest to it: 390 with the mobile board, and so on.
//
// Copy check: at every width the visible text of each design landmark is compared with the
// page's, so copy that was dropped or changed is listed (report.json widths.<w>.copy).
//
// State boards (menu open, step 2, …) are compared when --states names a spec, which is
// found automatically at tests/design-states/<screen>.json:
//   { "states": [ { "board": "mobile/Menu-open.dc.html", "width": 390,
//                   "steps": [ { "click": "button[aria-controls=site-menu]" } ],
//                   "mode": "viewport" } ] }
// Steps run on the converted page only: click, hover, focus, press (a key), scroll (a
// selector into view), wait (ms). "mode": "viewport" compares the first screen (for overlays
// like a drawer or modal); the default compares the whole page landmark by landmark.
//
// Requires the `playwright` package resolvable from the project
// (npm i -D playwright && npx playwright install chromium).
//
// Animations are disabled by default (prefers-reduced-motion: reduce) so the
// two sides are captured in a stable, comparable frame. Pass --motion to keep them.

import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { boardFor, findBoards, references, rel } from "./boards.mjs";

const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : def;
};
const flag = (name) => argv.includes(`--${name}`);

const original = opt("original");
const url = opt("url");
const outDir = opt("out", "capture");
const widths = opt("widths", "1440,1000,390").split(",").map(Number);
const only = opt("only");
if (!original && !url) {
  console.error("usage: node capture.mjs --original <Main.dc.html> --url <http://localhost:3000/> --out <dir>");
  process.exit(1);
}

// Resolve playwright from the project being captured (cwd), not from this
// script's folder: the skill may live in a different checkout than the project.
let chromium;
try {
  const { createRequire } = await import("node:module");
  const req = createRequire(path.join(process.cwd(), "package.json"));
  ({ chromium } = req("playwright"));
} catch {
  console.error(
    "playwright is not installed in this project.\n" +
      "Run: npm i -D playwright && npx playwright install chromium\n" +
      "(or tell the user which widths could not be verified)."
  );
  process.exit(2);
}

// Static server for the export folder: x-dc pages need http://, not file://.
function serve(folder) {
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2", ".json": "application/json" };
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const p = path.join(folder, decodeURIComponent(req.url.split("?")[0]));
      if (!p.startsWith(folder) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, { "content-type": types[path.extname(p)] || "application/octet-stream" });
      fs.createReadStream(p).pipe(res);
    });
    server.listen(0, () => resolve(server));
  });
}

// One static server per board folder (each export's ./assets/ paths are relative to it).
const boards = original ? findBoards(original) : null;
const servers = new Map();
async function boardUrl(file) {
  const folder = path.dirname(file);
  if (!servers.has(folder)) servers.set(folder, await serve(folder));
  return `http://localhost:${servers.get(folder).address().port}/${path.basename(file)}`;
}

// State specs: explicit --states, else tests/design-states/<screen>.json when it exists.
const screenName = boards ? path.basename(boards.screenDir) : null;
const statesFile = opt("states") ?? (screenName && path.join("tests", "design-states", `${screenName}.json`));
const stateSpecs = statesFile && fs.existsSync(statesFile) ? (JSON.parse(fs.readFileSync(statesFile, "utf8")).states ?? []) : [];

// Prefer Playwright's bundled Chromium; fall back to an installed Chrome/Edge
// so a missing `npx playwright install` doesn't block verification.
async function launch() {
  for (const channel of [undefined, "chrome", "msedge"]) {
    try {
      return await chromium.launch(channel ? { channel } : {});
    } catch (e) {
      console.error(`${channel ?? "bundled chromium"} unavailable: ${String(e.message).split("\n")[0]}`);
    }
  }
  console.error("No browser could be launched. Run: npx playwright install chromium");
  process.exit(2);
}
const browser = await launch();
const report = { boards: boards ? references(boards).map((b) => ({ board: rel(b.file), width: b.width, band: b.band })) : [], widths: {}, states: {}, notes: [] };
fs.mkdirSync(outDir, { recursive: true });

// Collect top-level landmarks, descending into open shadow roots (the x-dc
// runtime may render into one), with each landmark's visible text lines.
const collect = () => {
  const found = [];
  const walk = (root) => {
    for (const el of root.querySelectorAll("*")) {
      if (el.shadowRoot) walk(el.shadowRoot);
    }
    for (const el of root.querySelectorAll("header, section, footer")) {
      const parent = el.parentElement?.closest("header, section, footer");
      if (!parent) found.push(el);
    }
  };
  walk(document);
  const seen = new Set();
  return found
    .filter((el) => (seen.has(el) ? false : seen.add(el)))
    .map((el) => {
      const r = el.getBoundingClientRect();
      const h = el.querySelector("h1, h2");
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || "",
        heading: (h?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
        top: Math.round(r.top + window.scrollY),
        height: Math.round(r.height),
        text: el.innerText.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean),
      };
    })
    .filter((b) => b.height > 0)
    .sort((a, b) => a.top - b.top);
};

async function runSteps(page, steps = []) {
  for (const s of steps) {
    if (s.click) await page.click(s.click, { timeout: 5000 });
    else if (s.hover) await page.hover(s.hover, { timeout: 5000 });
    else if (s.focus) await page.focus(s.focus, { timeout: 5000 });
    else if (s.press) await page.keyboard.press(s.press);
    else if (s.scroll) await page.locator(s.scroll).first().scrollIntoViewIfNeeded({ timeout: 5000 });
    else if (s.wait) await page.waitForTimeout(s.wait);
  }
  await page.waitForTimeout(500);
}

/** Loads one side at one width and screenshots it: landmark by landmark, or the first screen ("viewport"). */
async function shoot(t, width, dir, { steps, mode } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: flag("motion") ? "no-preference" : "reduce",
  });
  const page = await ctx.newPage();
  const errors = [];
  // The x-dc runtime logs errors while parsing its own {{ }} templates; those are noise.
  const noise = (s) => t.side === "original" && (s.includes("{{") || s.includes("404"));
  page.on("console", (m) => m.type() === "error" && !noise(m.text()) && errors.push(m.text().slice(0, 300)));
  page.on("pageerror", (e) => !noise(String(e)) && errors.push(String(e).slice(0, 300)));
  await page.goto(t.url, { waitUntil: "networkidle", timeout: 60000 });
  // Hide the Next.js dev indicator so it doesn't show up as a difference.
  if (t.side === "converted") await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await page.evaluate(() => document.fonts.ready);
  // Scroll through so lazy images / IntersectionObserver content resolves.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  // Lazy images below the fold may still be loading (a cold next/image optimiser can take
  // seconds for a large source). Load them all and wait, or the capture shows empty boxes.
  await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = "eager")));
  await page
    .waitForFunction(() => [...document.images].every((img) => img.complete), null, { timeout: 30_000 })
    .catch(() => console.error(`[${t.side} ${width}] some images were still loading after 30s`));
  await page.waitForTimeout(800);

  let failed = "";
  if (steps?.length) {
    await runSteps(page, steps).catch((e) => (failed = String(e.message).split("\n")[0]));
    // A click scrolls its target into view, which moves sticky elements down the page and
    // reorders the landmarks. Measure from the top again, unless a viewport-mode state
    // scrolled somewhere on purpose.
    if (!(mode === "viewport" && steps.some((s) => s.scroll))) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);
    }
  }

  let landmarks = await page.evaluate(collect);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const shots = [];
  if (mode === "viewport") {
    const file = path.join(dir, `01-${t.side}-viewport.png`);
    await page.screenshot({ path: file });
    shots.push({ tag: "viewport", id: "", heading: "first screen", top: 0, height: 900, text: [], file });
    landmarks = [];
  } else {
    for (const [i, b] of landmarks.entries()) {
      const file = path.join(dir, `${String(i + 1).padStart(2, "0")}-${t.side}-${b.id || b.tag}.png`);
      await page.screenshot({ path: file, fullPage: true, clip: { x: 0, y: b.top, width, height: Math.min(b.height, 3000) } });
      shots.push({ ...b, file });
    }
  }
  await ctx.close();
  return { url: t.url, ...(t.board && { board: t.board, boardWidth: t.boardWidth }), pageHeight, horizontalOverflowPx: overflow, errors, ...(failed && { failed }), landmarks: shots };
}

/** Side-by-side pair images (rendered by the browser, so no image library is needed) plus a pixel diff per pair. */
async function pairUp(o, c, width, dir) {
  if (!o.length || !c.length) return;
  const pairDir = path.join(dir, "pairs");
  fs.mkdirSync(pairDir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: width * 2 + 24, height: 900 } });
  for (let i = 0; i < Math.max(o.length, c.length); i++) {
    const img = (s) => (s ? `<img src="data:image/png;base64,${fs.readFileSync(s.file).toString("base64")}">` : `<div class="miss">missing</div>`);
    const label = (s) => (s ? `${s.tag}${s.id ? "#" + s.id : ""} · ${s.height}px · ${s.heading}` : "—");
    await page.setContent(`<style>body{margin:0;font:13px system-ui;background:#888}.row{display:flex;gap:24px;align-items:flex-start}.col{width:${width}px}.lab{background:#111;color:#fff;padding:6px 10px}img{display:block;width:${width}px}.miss{height:200px;background:#c33;color:#fff;padding:20px}</style>
      <div class="row"><div class="col"><div class="lab">ORIGINAL ${label(o[i])}</div>${img(o[i])}</div><div class="col"><div class="lab">CONVERTED ${label(c[i])}</div>${img(c[i])}</div></div>`);
    const pairFile = path.join(pairDir, `${String(i + 1).padStart(2, "0")}.png`);
    await page.screenshot({ path: pairFile, fullPage: true });
    if (c[i]) c[i].pair = pairFile;
    // Pixel difference over the overlapping area: % of pixels whose RGB differs by >32 in any channel.
    if (o[i] && c[i]) {
      c[i].diffPct = await page.evaluate(async () => {
        const imgs = [...document.querySelectorAll("img")];
        await Promise.all(imgs.map((im) => (im.complete ? 0 : new Promise((r) => (im.onload = r)))));
        const [a, b] = imgs;
        const w = Math.min(a.naturalWidth, b.naturalWidth), h = Math.min(a.naturalHeight, b.naturalHeight);
        const data = (im) => { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const x = cv.getContext("2d"); x.drawImage(im, 0, 0); return x.getImageData(0, 0, w, h).data; };
        const da = data(a), db = data(b);
        let diff = 0;
        for (let p = 0; p < da.length; p += 4) if (Math.abs(da[p] - db[p]) > 32 || Math.abs(da[p + 1] - db[p + 1]) > 32 || Math.abs(da[p + 2] - db[p + 2]) > 32) diff++;
        return Math.round((diff / (w * h)) * 1000) / 10;
      });
    }
  }
  await page.close();
}

// Copy check: every line of design copy must appear on the page (case, whitespace, quote and
// dash styles ignored, line breaks may differ). Lines on the page that the design doesn't have
// are listed too; those are often fine (a skip link, a screen-reader label, a form message).
const norm = (s) =>
  s.replace(/[‘’´`]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/ /g, " ").replace(/\s+/g, " ").trim().toLowerCase();
const meaningful = (l) => l.length >= 3 && /[a-z]/i.test(l);
function compareCopy(o, c) {
  const lines = (side) => side.flatMap((b) => b.text.map((t) => ({ text: t, landmark: `${b.tag}${b.id ? `#${b.id}` : ""}` }))).filter((x) => meaningful(x.text));
  const [ol, cl] = [lines(o), lines(c)];
  const [oAll, cAll] = [ol.map((x) => norm(x.text)).join(" "), cl.map((x) => norm(x.text)).join(" ")];
  const uniq = (list) => [...new Map(list.map((x) => [norm(x.text), x])).values()];
  return {
    checked: ol.length,
    missing: uniq(ol.filter((x) => !cAll.includes(norm(x.text)))),
    extra: uniq(cl.filter((x) => !oAll.includes(norm(x.text)))),
  };
}

for (const width of widths) {
  const wDir = path.join(outDir, String(width));
  fs.mkdirSync(wDir, { recursive: true });
  const sides = (report.widths[width] = {});
  if (boards && only !== "converted") {
    const board = boardFor(boards, width);
    sides.original = await shoot({ side: "original", url: await boardUrl(board.file), board: rel(board.file), boardWidth: board.width }, width, wDir);
  }
  if (url && only !== "original") sides.converted = await shoot({ side: "converted", url }, width, wDir);
  const o = sides.original?.landmarks || [];
  const c = sides.converted?.landmarks || [];
  await pairUp(o, c, width, wDir);
  if (o.length && c.length) sides.copy = compareCopy(o, c);
}

// ---------- state boards ----------
if (boards && url && only !== "original") {
  for (const spec of stateSpecs) {
    const file = path.resolve(boards.screenDir, spec.board);
    const name = spec.name ?? path.basename(spec.board).replace(/\.dc\.html$/, "");
    const width = spec.width ?? boardFor(boards, 390).width ?? 390;
    const dir = path.join(outDir, "states", name);
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(file)) {
      report.states[name] = { board: spec.board, width, failed: `state board not found: ${rel(file)}` };
      continue;
    }
    const s = (report.states[name] = { board: rel(file), width, mode: spec.mode ?? "page" });
    s.original = await shoot({ side: "original", url: await boardUrl(file), board: rel(file) }, width, dir, { mode: spec.mode });
    s.converted = await shoot({ side: "converted", url }, width, dir, { steps: spec.steps, mode: spec.mode });
    if (s.converted.failed) s.failed = s.converted.failed;
    await pairUp(s.original.landmarks, s.converted.landmarks, width, dir);
  }
  const specced = new Set(stateSpecs.map((x) => path.resolve(boards.screenDir, x.board)));
  const unchecked = boards.boards.filter((b) => b.role === "state" && !specced.has(b.file));
  if (unchecked.length) report.notes.push(`State boards not checked (no entry in ${statesFile ?? "tests/design-states/<screen>.json"}): ${unchecked.map((b) => rel(b.file)).join(", ")}`);
}

await browser.close();
for (const s of servers.values()) s.close();

// ---------- markdown report ----------
const lines = [`# Capture report`, ``];
if (report.boards.length > 1) {
  lines.push(`Design boards: ${report.boards.map((b) => `${b.board} (${b.band}, ${b.width}px)`).join(" · ")}. Each width is compared with the board drawn nearest to it.`, ``);
}
const pairTable = (o, c, pairPath) => {
  const out = [];
  if (o.length !== c.length) out.push(`- ⚠ landmark count differs: original ${o.length}, converted ${c.length} — pairs below are misaligned after the first missing/extra one`);
  out.push(``, `| # | original | h | converted | h | Δ | pixel diff % |`, `|---|---|---|---|---|---|---|`);
  for (let i = 0; i < Math.max(o.length, c.length); i++) {
    const a = o[i], b = c[i];
    const d = a && b ? b.height - a.height : null;
    const pct = a && b ? Math.abs(d) / Math.max(a.height, 1) : 0;
    out.push(`| ${i + 1} | ${a ? `${a.tag}#${a.id}` : "—"} | ${a?.height ?? "—"} | ${b ? `${b.tag}#${b.id}` : "—"} | ${b?.height ?? "—"} | ${d === null ? "—" : `${d > 0 ? "+" : ""}${d}${pct > 0.04 ? " ⚠" : ""}`} | ${b?.diffPct ?? "—"} |`);
  }
  const ranked = c.map((b, i) => ({ i: i + 1, s: b.diffPct ?? 0 })).filter((x) => x.s > 0).sort((x, y) => y.s - x.s);
  if (ranked.length) out.push(``, `Inspect first (highest pixel diff): ${ranked.slice(0, 6).map((x) => `${pairPath}/${String(x.i).padStart(2, "0")}.png (${x.s}%)`).join(", ")}`);
  return out;
};
for (const [w, sides] of Object.entries(report.widths)) {
  lines.push(`## ${w}px`);
  for (const side of ["original", "converted"]) {
    const r = sides[side];
    if (!r) continue;
    lines.push(`- ${side}${r.board && report.boards.length > 1 ? ` (board ${r.board}, drawn at ${r.boardWidth ?? "?"}px)` : ""}: page ${r.pageHeight}px tall, ${r.landmarks.length} landmarks, horizontal overflow ${r.horizontalOverflowPx}px${r.horizontalOverflowPx > 0 ? " ⚠" : ""}, console errors ${r.errors.length}${r.errors.length ? " ⚠" : ""}`);
    for (const e of r.errors) lines.push(`  - \`${e.replace(/\n/g, " ")}\``);
  }
  const o = sides.original?.landmarks || [];
  const c = sides.converted?.landmarks || [];
  if (o.length && c.length) {
    lines.push(...pairTable(o, c, `${w}/pairs`));
    const cp = sides.copy;
    lines.push(``, `Copy: ${cp.checked} design lines checked, **${cp.missing.length} missing on the page**${cp.missing.length ? " ⚠" : ""}, ${cp.extra.length} on the page but not in the design.`);
    for (const m of cp.missing.slice(0, 25)) lines.push(`- missing (${m.landmark}): "${m.text.slice(0, 120)}"`);
    if (cp.extra.length) lines.push(`- on the page only: ${cp.extra.slice(0, 12).map((x) => `"${x.text.slice(0, 60)}"`).join("; ")}${cp.extra.length > 12 ? ` … +${cp.extra.length - 12}` : ""}`);
  } else {
    // single side (--only): still list landmarks so the design's structure is visible
    const one = o.length ? o : c;
    lines.push(``, `| # | landmark | top | h | heading |`, `|---|---|---|---|---|`);
    one.forEach((b, i) => lines.push(`| ${i + 1} | ${b.tag}#${b.id} | ${b.top} | ${b.height} | ${b.heading} |`));
  }
  lines.push(``);
}
if (Object.keys(report.states).length) {
  lines.push(`## State boards`);
  for (const [name, s] of Object.entries(report.states)) {
    lines.push(``, `### ${name} (${s.board}, ${s.width}px, ${s.mode ?? "page"})`);
    if (s.failed) lines.push(`- ⚠ couldn't reproduce the state: ${s.failed}`);
    if (s.original && s.converted) lines.push(...pairTable(s.original.landmarks, s.converted.landmarks, `states/${name}/pairs`));
  }
  lines.push(``);
}
for (const n of report.notes) lines.push(`- ⚠ ${n}`);
lines.push(`Pair images: <out>/<width>/pairs/NN.png (original left, converted right). ⚠ = >4% height drift, overflow, errors or missing copy.`);
fs.writeFileSync(path.join(outDir, "report.md"), lines.join("\n"));
fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
console.log(lines.join("\n"));
