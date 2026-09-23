#!/usr/bin/env node
// Screenshots the original x-dc export and the converted Next.js route,
// landmark by landmark (header / section / footer, in DOM order), at several
// viewport widths, and writes side-by-side pair images plus a height report.
//
// Usage:
//   node capture.mjs --original screens/<screen>/Main.dc.html \
//                    --url http://localhost:3000/<route> \
//                    --out <dir> [--widths 1440,1000,390] [--motion] [--only original|converted]
//
// Requires the `playwright` package resolvable from the project
// (npm i -D playwright && npx playwright install chromium).
//
// Animations are disabled by default (prefers-reduced-motion: reduce) so the
// two sides are captured in a stable, comparable frame. Pass --motion to keep them.

import fs from "node:fs";
import path from "node:path";
import http from "node:http";

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

const targets = [];
let server;
if (original && only !== "converted") {
  const folder = path.resolve(path.dirname(original));
  server = await serve(folder);
  targets.push({ side: "original", url: `http://localhost:${server.address().port}/${path.basename(original)}` });
}
if (url && only !== "original") targets.push({ side: "converted", url });

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
const report = { widths: {}, notes: [] };
fs.mkdirSync(outDir, { recursive: true });

// Collect top-level landmarks, descending into open shadow roots (the x-dc
// runtime may render into one).
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
      };
    })
    .filter((b) => b.height > 0)
    .sort((a, b) => a.top - b.top);
};

for (const width of widths) {
  const wDir = path.join(outDir, String(width));
  fs.mkdirSync(wDir, { recursive: true });
  report.widths[width] = {};
  for (const t of targets) {
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
    await page.waitForTimeout(800);

    const landmarks = await page.evaluate(collect);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const shots = [];
    for (const [i, b] of landmarks.entries()) {
      const name = `${String(i + 1).padStart(2, "0")}-${t.side}-${b.id || b.tag}.png`;
      const file = path.join(wDir, name);
      await page.screenshot({
        path: file,
        fullPage: true,
        clip: { x: 0, y: b.top, width, height: Math.min(b.height, 3000) },
      });
      shots.push({ ...b, file });
    }
    report.widths[width][t.side] = { url: t.url, pageHeight, horizontalOverflowPx: overflow, errors, landmarks: shots };
    await ctx.close();
  }

  // Side-by-side pair images, rendered by the browser so no image library is needed.
  const o = report.widths[width].original?.landmarks || [];
  const c = report.widths[width].converted?.landmarks || [];
  if (o.length && c.length) {
    const pairDir = path.join(wDir, "pairs");
    fs.mkdirSync(pairDir, { recursive: true });
    const page = await browser.newPage({ viewport: { width: width * 2 + 24, height: 900 } });
    for (let i = 0; i < Math.max(o.length, c.length); i++) {
      const img = (s) => (s ? `<img src="data:image/png;base64,${fs.readFileSync(s.file).toString("base64")}">` : `<div class="miss">missing</div>`);
      const label = (s) => (s ? `${s.tag}${s.id ? "#" + s.id : ""} · ${s.height}px · ${s.heading}` : "—");
      await page.setContent(`<style>body{margin:0;font:13px system-ui;background:#888}.row{display:flex;gap:24px;align-items:flex-start}.col{width:${width}px}.lab{background:#111;color:#fff;padding:6px 10px}img{display:block;width:${width}px}.miss{height:200px;background:#c33;color:#fff;padding:20px}</style>
        <div class="row"><div class="col"><div class="lab">ORIGINAL ${label(o[i])}</div>${img(o[i])}</div><div class="col"><div class="lab">CONVERTED ${label(c[i])}</div>${img(c[i])}</div></div>`);
      await page.screenshot({ path: path.join(pairDir, `${String(i + 1).padStart(2, "0")}.png`), fullPage: true });
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
}

await browser.close();
server?.close();

// ---------- markdown report ----------
const lines = [`# Capture report`, ``];
for (const [w, sides] of Object.entries(report.widths)) {
  lines.push(`## ${w}px`);
  for (const [side, r] of Object.entries(sides)) {
    lines.push(`- ${side}: page ${r.pageHeight}px tall, ${r.landmarks.length} landmarks, horizontal overflow ${r.horizontalOverflowPx}px${r.horizontalOverflowPx > 0 ? " ⚠" : ""}, console errors ${r.errors.length}${r.errors.length ? " ⚠" : ""}`);
    for (const e of r.errors) lines.push(`  - \`${e.replace(/\n/g, " ")}\``);
  }
  const o = sides.original?.landmarks || [];
  const c = sides.converted?.landmarks || [];
  if (o.length && c.length) {
    if (o.length !== c.length) lines.push(`- ⚠ landmark count differs: original ${o.length}, converted ${c.length} — pairs below are misaligned after the first missing/extra one`);
    lines.push(``, `| # | original | h | converted | h | Δ | pixel diff % |`, `|---|---|---|---|---|---|---|`);
    for (let i = 0; i < Math.max(o.length, c.length); i++) {
      const a = o[i], b = c[i];
      const d = a && b ? b.height - a.height : null;
      const pct = a && b ? Math.abs(d) / Math.max(a.height, 1) : 0;
      lines.push(`| ${i + 1} | ${a ? `${a.tag}#${a.id}` : "—"} | ${a?.height ?? "—"} | ${b ? `${b.tag}#${b.id}` : "—"} | ${b?.height ?? "—"} | ${d === null ? "—" : `${d > 0 ? "+" : ""}${d}${pct > 0.04 ? " ⚠" : ""}`} | ${b?.diffPct ?? "—"} |`);
    }
    const ranked = c.map((b, i) => ({ i: i + 1, s: b.diffPct ?? 0 })).filter((x) => x.s > 0).sort((x, y) => y.s - x.s);
    if (ranked.length) lines.push(``, `Inspect first (highest pixel diff): ${ranked.slice(0, 6).map((x) => `pairs/${String(x.i).padStart(2, "0")}.png (${x.s}%)`).join(", ")}`);
  } else {
    // single side (--only): still list landmarks so the design's structure is visible
    const one = o.length ? o : c;
    lines.push(``, `| # | landmark | top | h | heading |`, `|---|---|---|---|---|`);
    one.forEach((b, i) => lines.push(`| ${i + 1} | ${b.tag}#${b.id} | ${b.top} | ${b.height} | ${b.heading} |`));
  }
  lines.push(``);
}
lines.push(`Pair images: <out>/<width>/pairs/NN.png (original left, converted right). ⚠ = >4% height drift, overflow, or errors.`);
fs.writeFileSync(path.join(outDir, "report.md"), lines.join("\n"));
fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
console.log(lines.join("\n"));
