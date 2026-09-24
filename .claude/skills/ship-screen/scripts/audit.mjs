#!/usr/bin/env node
// Production audit for the ship-screen pipeline. Starts `next start` on the
// existing build (or uses --url), then runs any of:
//   console    console errors/warnings, page errors, failed requests (1440 + 390)
//   links      every internal link resolves (status + #anchor target exists)
//   axe        axe-core WCAG 2.2 AA scan (1440 + 390)
//   headers    security response headers
//   lighthouse Lighthouse mobile + desktop (--modes), checked against budgets
//   capture    design fidelity vs the screens/ export (needs --original), via screen-to-nextjs/capture.mjs;
//              each width is compared with the nearest design board (mobile board at 390, if there is one)
//   sweep      responsive sweep: horizontal overflow or cut-off content at 320-1920 (WCAG 1.4.10 reflow
//              at 320), and text-spacing overrides at 390/1440 (WCAG 1.4.12)
//   focus      keyboard walk at 1440 + 390: every Tab stop's focus indicator, whether it's hidden
//              (off-screen or covered, WCAG 2.4.11), focus traps, and a contact sheet of every stop
// Writes <out>/audit.md + audit.json and prints the markdown.
//
// Usage (from the project root, after `npm run build`):
//   node .claude/skills/ship-screen/scripts/audit.mjs --routes / [--checks console,links,axe,focus,sweep,headers,lighthouse,capture]
//        [--original screens/<screen>/Main.dc.html | --original home=screens/homepage/Main.dc.html,pricing=screens/pricing/Main.dc.html]
//        [--widths 1440,1000,390] [--modes mobile,desktop] [--sweep-widths 320,360,…]
//        [--out .quality/<screen>/audit] [--url http://localhost:3000] [--budget mobile.perf=85,desktop.lcp=2000] [--strict]
//        [--quick [--links]] [--baseline .quality/<screen>/baseline.json [--phase <id>] [--reset-baseline]]
// Default checks: everything except capture (capture is added automatically when --original is given).
// A plain --original belongs to the first route; route=path pairs give each route its own design
// export (screens.mjs others prints them). A route without one skips the capture.
//
// --quick is the per-phase regression check: console, axe, focus, sweep, headers, capture (with
// --original) and Lighthouse, at 1440 + 390 and mobile only, in about 2-3 minutes. --links adds
// the link check to it (the build gate does this once, so broken links are known from the start).
// --baseline compares every tracked metric with the best value earlier phases reached (see
// baseline.mjs) and exits 1 on a regression. A Lighthouse run that looks regressed is measured
// once more and the better run kept, so localhost noise doesn't count. --phase also records the
// result in the baseline (keeping each metric's best value when nothing regressed);
// --reset-baseline starts a fresh one from this result.
//
// Needs `playwright` (and `axe-core` for the axe check) resolvable from the project.

import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { compare, describe, load, metricsOf, record, save } from "./baseline.mjs";

const argv = process.argv.slice(2);
const opt = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : d;
};
const flag = (n) => argv.includes(`--${n}`);

const cwd = process.cwd();
const req = createRequire(path.join(cwd, "package.json"));
// Git Bash (MSYS) rewrites a "/about" argument into "C:/Program Files/Git/about"; undo that,
// and accept routes written without the leading slash ("about", "home" = "/").
const normalizeRoute = (r) => {
  const msys = r.match(/^[A-Za-z]:[\\/].*?[\\/]Git([\\/].*)?$/i);
  let route = msys ? (msys[1] || "/").replace(/\\/g, "/") : r;
  if (route === "home") route = "/";
  return route.startsWith("/") ? route : `/${route}`;
};
const routes = opt("routes", "/").split(",").map((r) => r.trim()).filter(Boolean).map(normalizeRoute);
const quick = flag("quick");
// Design exports per route: "screens/x/Main.dc.html" (first route) or "home=screens/a/Main.dc.html,pricing=…".
const originals = new Map();
for (const part of (opt("original") ?? "").split(",").filter(Boolean)) {
  const eq = part.indexOf("=");
  if (eq > 0) originals.set(normalizeRoute(part.slice(0, eq)), part.slice(eq + 1));
  else originals.set(routes[0], part);
}
const checks = new Set(opt("checks", `console,${quick ? "" : "links,"}axe,focus,sweep,headers,lighthouse${originals.size ? ",capture" : ""}`).split(","));
if (flag("links")) checks.add("links");
const modes = opt("modes", quick ? "mobile" : "mobile,desktop").split(",");
const widths = opt("widths", quick ? "1440,390" : "1440,1000,390");
const outDir = opt("out", ".quality/audit");
fs.mkdirSync(outDir, { recursive: true });
const baselineFile = opt("baseline");
const baselineBefore = baselineFile && !flag("reset-baseline") ? load(baselineFile) : null;

const budgets = {
  desktop: { perf: 90, a11y: 95, bp: 95, seo: 95, lcp: 2500, cls: 0.1, tbt: 200 },
  mobile: { perf: 80, a11y: 95, bp: 95, seo: 95, lcp: 4000, cls: 0.1, tbt: 300 },
};
for (const pair of (opt("budget", "") || "").split(",").filter(Boolean)) {
  const [key, value] = pair.split("=");
  const [mode, metric] = key.split(".");
  if (budgets[mode] && metric in budgets[mode]) budgets[mode][metric] = Number(value);
}

// ---------- server ----------
const freePort = () =>
  new Promise((resolve) => {
    const s = net.createServer();
    s.listen(0, () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });

let server;
let base = opt("url");
if (!base) {
  if (!fs.existsSync(path.join(cwd, ".next", "BUILD_ID"))) {
    console.error("No production build found (.next/BUILD_ID). Run `npm run build` (or gates.mjs) first, or pass --url.");
    process.exit(2);
  }
  const port = Number(opt("port", 0)) || (await freePort());
  const nextBin = req.resolve("next/dist/bin/next");
  let log = "";
  server = spawn(process.execPath, [nextBin, "start", "-p", String(port)], { cwd, stdio: ["ignore", "pipe", "pipe"] });
  server.stdout.on("data", (d) => (log += d));
  server.stderr.on("data", (d) => (log += d));
  base = `http://localhost:${port}`;
  const deadline = Date.now() + 60_000;
  for (;;) {
    try {
      const r = await fetch(base + routes[0], { signal: AbortSignal.timeout(5000) });
      if (r.status < 500) break;
    } catch {}
    if (Date.now() > deadline || server.exitCode !== null) {
      server.kill();
      console.error(`next start did not come up on ${base}:\n${log.slice(-1500)}`);
      process.exit(2);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}
const stop = () => server && !server.killed && server.kill();
process.on("exit", stop);
process.on("SIGINT", () => process.exit(130));

// ---------- browser ----------
let chromium;
try {
  ({ chromium } = req("playwright"));
} catch {
  console.error("playwright is not installed in this project: npm i -D playwright");
  process.exit(2);
}
async function launch() {
  for (const channel of [undefined, "chrome", "msedge"]) {
    try {
      return await chromium.launch(channel ? { channel } : {});
    } catch {}
  }
  console.error("No browser could be launched. Run: npx playwright install chromium");
  process.exit(2);
}
const needsBrowser = ["console", "links", "axe", "focus", "sweep"].some((c) => checks.has(c));
const browser = needsBrowser ? await launch() : null;

async function openPage(route, width, reducedMotion = "no-preference") {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion });
  const page = await ctx.newPage();
  const events = [];
  page.on("console", (m) => ["error", "warning"].includes(m.type()) && events.push({ kind: `console.${m.type()}`, text: m.text().slice(0, 300) }));
  page.on("pageerror", (e) => events.push({ kind: "pageerror", text: String(e).slice(0, 300) }));
  page.on("requestfailed", (r) => events.push({ kind: "requestfailed", text: `${r.url()} (${r.failure()?.errorText})` }));
  page.on("response", (r) => r.status() >= 400 && events.push({ kind: `http ${r.status()}`, text: r.url() }));
  let inflight = 0;
  page.on("request", () => inflight++);
  page.on("requestfinished", () => inflight--);
  page.on("requestfailed", () => inflight--);
  await page.goto(base + route, { waitUntil: "networkidle", timeout: 60_000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  // Scrolling makes Next prefetch the links it brings into view (a 404 for a page that doesn't
  // exist yet shows up here). Wait until the network is quiet for 600ms, at most 5s.
  const t0 = Date.now();
  let quietSince = Date.now();
  while (Date.now() - t0 < 5000) {
    await page.waitForTimeout(100);
    if (inflight > 0) quietSince = Date.now();
    else if (Date.now() - quietSince >= 600) break;
  }
  return { ctx, page, events };
}

const report = { base, routes, checks: [...checks], budgets, results: {} };
const md = [`# Audit`, ``, `Server: ${base} · routes: ${routes.join(", ")}`, ``];
const summary = [];
const add = (check, route, status, note) => summary.push({ check, route, status, note });

let lighthouseEnv;
function findChrome() {
  const env = { ...process.env };
  if (!env.CHROME_PATH) {
    const candidates = [
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
      "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
    ];
    try {
      candidates.unshift(chromium.executablePath());
    } catch {}
    const found = candidates.find((p) => p && fs.existsSync(p));
    if (found) env.CHROME_PATH = found;
  }
  return env;
}

/** One Lighthouse run → { scores, metrics, lcpElement, lcpChecklist, failing, report } or { error }. */
function lighthouse(route, mode, file) {
  lighthouseEnv ??= findChrome();
  const cmd = `npx -y lighthouse@12 "${base + route}" --output=json --output-path="${file}" --quiet --chrome-flags="--headless=new" ${mode === "desktop" ? "--preset=desktop" : ""}`;
  const run = spawnSync(cmd, { shell: true, env: lighthouseEnv, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (!fs.existsSync(file)) return { error: (run.stderr || "").split("\n").filter(Boolean).slice(-2).join(" ") };
  const lh = JSON.parse(fs.readFileSync(file, "utf8"));
  const a = lh.audits;
  const cat = (k) => Math.round((lh.categories[k]?.score ?? 0) * 100);
  const scores = { perf: cat("performance"), a11y: cat("accessibility"), bp: cat("best-practices"), seo: cat("seo") };
  const metrics = {
    lcp: Math.round(a["largest-contentful-paint"]?.numericValue ?? 0),
    cls: Math.round((a["cumulative-layout-shift"]?.numericValue ?? 0) * 1000) / 1000,
    tbt: Math.round(a["total-blocking-time"]?.numericValue ?? 0),
    fcp: Math.round(a["first-contentful-paint"]?.numericValue ?? 0),
  };
  const findSnippet = (o) => {
    if (!o || typeof o !== "object") return "";
    if (typeof o.snippet === "string") return o.snippet.slice(0, 160);
    for (const v of Object.values(o)) {
      const s = findSnippet(v);
      if (s) return s;
    }
    return "";
  };
  const lcpElement = findSnippet(a["largest-contentful-paint-element"]?.details);
  const lcpChecklist = [];
  const walk = (o) => {
    if (!o || typeof o !== "object") return;
    if (o.type === "checklist") for (const v of Object.values(o.items)) lcpChecklist.push({ ok: !!v.value, label: v.label });
    for (const v of Object.values(o)) walk(v);
  };
  walk(a["lcp-discovery-insight"]?.details);
  // The canonical/hreflang audits compare against the production domain, so they fail on localhost by design.
  const localNoise = new Set(["canonical", "hreflang"]);
  const failing = Object.values(a)
    .filter((x) => typeof x.score === "number" && x.score < 0.9 && ["binary", "numeric", "metricSavings"].includes(x.scoreDisplayMode))
    .sort((x, y) => x.score - y.score)
    .map((x) => ({ id: x.id, title: x.title, score: x.score, value: x.displayValue ?? "", expectedOnLocalhost: localNoise.has(x.id) }));
  // How fast this machine was during the run; baseline.mjs only compares runs at similar speeds.
  const benchmarkIndex = Math.round(lh.environment?.benchmarkIndex ?? 0) || undefined;
  return { scores, metrics, benchmarkIndex, lcpElement, lcpChecklist, failing: failing.slice(0, 15), report: file };
}

for (const route of routes) {
  const r = (report.results[route] = {});

  // ---------- console ----------
  if (checks.has("console")) {
    const all = [];
    for (const width of [1440, 390]) {
      const { ctx, events } = await openPage(route, width);
      all.push(...events.map((e) => ({ ...e, width })));
      await ctx.close();
    }
    r.console = all;
    const errors = all.filter((e) => e.kind !== "console.warning");
    add("console", route, errors.length ? "FAIL" : all.length ? "WARN" : "PASS", `${errors.length} errors, ${all.length - errors.length} warnings`);
  }

  // ---------- links ----------
  if (checks.has("links")) {
    const { ctx, page } = await openPage(route, 1440);
    const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")))]);
    const ids = await page.evaluate(() => [...document.querySelectorAll("[id]")].map((e) => e.id));
    await ctx.close();
    const internal = hrefs.filter((h) => h && !/^(https?:|mailto:|tel:|javascript:)/i.test(h) || (h && h.startsWith(base)));
    const broken = [];
    const htmlCache = new Map();
    for (const href of internal) {
      const u = new URL(href, base + route);
      const samePage = u.pathname === new URL(base + route).pathname;
      if (!samePage) {
        if (!htmlCache.has(u.pathname)) {
          const res = await fetch(base + u.pathname).catch(() => null);
          htmlCache.set(u.pathname, { status: res?.status ?? 0, html: res && res.ok ? await res.text() : "" });
        }
        const t = htmlCache.get(u.pathname);
        if (t.status >= 400 || t.status === 0) {
          broken.push({ href, problem: `HTTP ${t.status}` });
          continue;
        }
        if (u.hash && !new RegExp(`id="${u.hash.slice(1)}"`).test(t.html)) broken.push({ href, problem: `no element ${u.hash} on ${u.pathname}` });
      } else if (u.hash && u.hash !== "#" && !ids.includes(decodeURIComponent(u.hash.slice(1)))) {
        broken.push({ href, problem: `no element ${u.hash} on this page` });
      } else if (href === "#") {
        broken.push({ href, problem: "placeholder link (#)" });
      }
    }
    r.links = { checked: internal.length, broken };
    add("links", route, broken.length ? "FAIL" : "PASS", `${internal.length} internal links, ${broken.length} broken`);
  }

  // ---------- axe ----------
  if (checks.has("axe")) {
    let axePath;
    try {
      axePath = req.resolve("axe-core/axe.min.js");
    } catch {
      add("axe", route, "SKIP", "axe-core not installed (npm i -D axe-core)");
    }
    if (axePath) {
      const byRule = new Map();
      let incomplete = 0;
      for (const width of [1440, 390]) {
        // Reduced motion so entrance animations don't leave text mid-fade during contrast checks.
        const { ctx, page } = await openPage(route, width, "reduce");
        await page.addScriptTag({ path: axePath });
        const res = await page.evaluate(() =>
          // eslint-disable-next-line no-undef
          axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } }),
        );
        incomplete += res.incomplete.length;
        for (const v of res.violations) {
          const prev = byRule.get(v.id) ?? { id: v.id, impact: v.impact, help: v.help, tags: v.tags, widths: [], nodes: [] };
          prev.widths.push(width);
          for (const n of v.nodes.slice(0, 4)) prev.nodes.push({ target: n.target.join(" "), summary: (n.failureSummary || "").split("\n")[1]?.trim() ?? "" });
          byRule.set(v.id, prev);
        }
        await ctx.close();
      }
      const violations = [...byRule.values()];
      r.axe = { violations, incomplete };
      const serious = violations.filter((v) => ["critical", "serious"].includes(v.impact));
      add("axe", route, serious.length ? "FAIL" : violations.length ? "WARN" : "PASS", `${violations.length} rules violated (${serious.length} serious/critical), ${incomplete} need manual review`);
    }
  }

  // ---------- sweep (responsive: every width between the design boards, 320px reflow, text spacing) ----------
  if (checks.has("sweep")) {
    const sweepWidths = opt("sweep-widths", "320,360,414,600,768,834,1024,1280,1920").split(",").map(Number);
    const ctx = await browser.newContext({ viewport: { width: sweepWidths[0], height: 900 }, reducedMotion: "reduce", bypassCSP: true });
    const page = await ctx.newPage();
    await page.goto(base + route, { waitUntil: "networkidle", timeout: 60_000 });
    // Content past the viewport edge that isn't inside a scroll/clip container (a swipe row, a
    // section clipping its decoration) or a fixed layer (an off-canvas drawer): it either scrolls
    // the page sideways or is cut off. Plus text that its own overflow:hidden box cuts off.
    const measure = (tag) =>
      page.evaluate((tag) => {
        const vw = document.documentElement.clientWidth;
        const name = (el) => el.tagName.toLowerCase() + (el.id ? `#${el.id}` : "") + [...el.classList].slice(0, 2).map((c) => `.${c}`).join("");
        const contained = (el) => {
          for (let p = el; p && p !== document.body; p = p.parentElement) {
            const cs = getComputedStyle(p);
            if (cs.position === "fixed" || cs.visibility === "hidden") return true;
            if (p !== el && cs.overflowX !== "visible") return true;
          }
          return false;
        };
        const off = [];
        const clipped = [];
        for (const el of document.body.querySelectorAll("*")) {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          if ((r.right > vw + 1 || r.left < -1) && !contained(el)) off.push({ el, past: Math.round(Math.max(r.right - vw, -r.left)) });
          const cs = getComputedStyle(el);
          const text = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          const clips = ["hidden", "clip"].includes(cs.overflowX) || ["hidden", "clip"].includes(cs.overflowY);
          if (text && clips && (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2)) {
            if (tag) el.setAttribute("data-audit-clipped", "");
            else if (!el.hasAttribute("data-audit-clipped")) clipped.push(name(el));
          }
        }
        const parents = new Set(off.map((o) => o.el));
        const outer = off.filter((o) => !parents.has(o.el.parentElement));
        return { overflow: Math.max(0, document.documentElement.scrollWidth - vw), offenders: outer.slice(0, 5).map((o) => `${name(o.el)} (${o.past}px past the edge)`), clipped: clipped.slice(0, 5), clippedCount: clipped.length };
      }, tag);
    const at = async (w) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(300);
    };
    const perWidth = [];
    for (const w of sweepWidths) {
      await at(w);
      const m = await measure(false);
      perWidth.push({ width: w, overflow: m.overflow, offenders: m.offenders });
    }
    // WCAG 1.4.12: with line-height 1.5, letter-spacing .12em, word-spacing .16em and paragraph
    // spacing 2em, nothing may be cut off. Text already clipped without the overrides isn't counted.
    const baseOverflow = {};
    for (const w of [390, 1440]) {
      await at(w);
      baseOverflow[w] = (await measure(true)).overflow;
    }
    await page.addStyleTag({ content: "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}" });
    const textSpacing = [];
    for (const w of [390, 1440]) {
      await at(w);
      const m = await measure(false);
      // Only the extra sideways scroll the spacing causes counts; the sweep already reports the rest.
      textSpacing.push({ width: w, ...m, overflow: Math.max(0, m.overflow - baseOverflow[w]) });
    }
    await ctx.close();
    const failing = perWidth.filter((p) => p.overflow > 0 || p.offenders.length);
    const spacingIssues = textSpacing.reduce((n, t) => n + (t.overflow > 0 ? 1 : 0) + t.clippedCount, 0);
    r.sweep = { perWidth, textSpacing, failingWidths: failing.length, textSpacingIssues: spacingIssues };
    const scrolls = failing.filter((p) => p.overflow > 0);
    add(
      "sweep",
      route,
      scrolls.length ? "FAIL" : failing.length || spacingIssues ? "WARN" : "PASS",
      `${sweepWidths.length} widths ${sweepWidths[0]}-${sweepWidths.at(-1)}: ${scrolls.length ? `scrolls sideways at ${scrolls.map((p) => p.width).join("/")}` : "no sideways scroll"}${failing.length > scrolls.length ? `, content cut off at ${failing.filter((p) => !p.overflow).map((p) => p.width).join("/")}` : ""} · text spacing: ${spacingIssues} issue(s)`,
    );
  }

  // ---------- focus (keyboard walk: indicator, hidden focus, traps) ----------
  if (checks.has("focus")) {
    const slug = route === "/" ? "home" : route.replace(/^\/|\/$/g, "").replace(/\//g, "_");
    const perWidth = [];
    for (const width of [1440, 390]) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce", bypassCSP: true });
      const page = await ctx.newPage();
      await page.goto(base + route, { waitUntil: "networkidle", timeout: 60_000 });
      // Smooth scrolling would still be moving the focused element into view when it's measured.
      await page.addStyleTag({ content: "html,*{scroll-behavior:auto!important}" });
      const stops = [];
      const shots = [];
      const seen = new Set();
      let trapped = false;
      let capped = false;
      for (let i = 0; ; i++) {
        if (i >= 200) {
          capped = true;
          break;
        }
        await page.keyboard.press("Tab");
        const s = await page.evaluate(async () => {
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          const el = document.activeElement;
          if (!el || el === document.body || el === document.documentElement) return null;
          const name = (e) => e.tagName.toLowerCase() + (e.id ? `#${e.id}` : "") + [...e.classList].slice(0, 2).map((c) => `.${c}`).join("");
          const key = (e) => {
            const parts = [];
            for (; e && e !== document.body; e = e.parentElement) parts.unshift(`${e.tagName}:${e.parentElement ? [...e.parentElement.children].indexOf(e) : 0}`);
            return parts.join(">");
          };
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          const visible = (c) => !!c && c !== "transparent" && !/rgba\([^)]*,\s*0(\.0+)?\)$/.test(c);
          const outline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0 && visible(cs.outlineColor);
          const ring =
            cs.boxShadow !== "none" &&
            cs.boxShadow.split(/,(?![^(]*\))/).some((layer) => {
              const color = (layer.match(/rgba?\([^)]*\)/) || ["rgb(0, 0, 0)"])[0];
              const [, , blur = 0, spread = 0] = (layer.match(/-?[\d.]+px/g) || []).map(parseFloat);
              return visible(color) && (blur !== 0 || spread !== 0);
            });
          const offscreen = !r.width || !r.height || r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth;
          const cx = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1);
          const cy = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
          const top = offscreen ? null : document.elementFromPoint(cx, cy);
          const covered = top && !el.contains(top) && !top.contains(el) ? name(top) : "";
          const label = (el.getAttribute("aria-label") || el.innerText || el.value || "").replace(/\s+/g, " ").trim().slice(0, 50);
          return { key: key(el), name: name(el), label, rect: { x: r.left, y: r.top, w: r.width, h: r.height }, indicator: outline ? "outline" : ring ? "ring" : "", hidden: offscreen ? "off-screen" : covered ? `covered by ${covered}` : "" };
        });
        // Past the last stop, Chrome moves focus to the browser (activeElement = body) before it
        // wraps. So coming back to any earlier stop, the first one included, without passing
        // through body means a script is holding focus: a trap.
        if (!s) break;
        if (seen.has(s.key)) {
          // Tabbing through an embed's own controls keeps the <iframe> as activeElement.
          if (s.name.startsWith("iframe") && stops.at(-1)?.key === s.key) continue;
          trapped = true; // came back to an earlier stop without reaching the end
          break;
        }
        seen.add(s.key);
        stops.push(s);
        if (!s.hidden) shots.push({ n: stops.length, s, img: (await page.screenshot({ type: "jpeg", quality: 70 })).toString("base64") });
      }
      await ctx.close();
      // Contact sheet: each stop cropped from its viewport screenshot, so the focus ring can be judged by eye.
      const sheetFile = path.join(outDir, `focus-${slug}-${width}.png`);
      if (shots.length) {
        const cells = shots
          .map(({ n, s, img }) => {
            const x = Math.max(0, Math.round(s.rect.x) - 16);
            const y = Math.max(0, Math.round(s.rect.y) - 16);
            const w = Math.min(560, Math.round(s.rect.w) + 32, width - x);
            const h = Math.min(220, Math.round(s.rect.h) + 32, 900 - y);
            const esc = (t) => t.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
            return `<div class="c"><div class="l">${n}. ${esc(s.name)}${s.indicator ? "" : " · NO RING/OUTLINE"} ${esc(s.label)}</div><div style="width:${w}px;height:${h}px;background:url(data:image/jpeg;base64,${img}) -${x}px -${y}px no-repeat"></div></div>`;
          })
          .join("");
        const sheet = await browser.newPage({ viewport: { width: 1200, height: 900 } });
        await sheet.setContent(`<style>body{margin:0;padding:12px;background:#777;font:12px system-ui;display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start}.c{background:#fff}.l{background:#111;color:#fff;padding:4px 6px;max-width:560px;overflow:hidden;white-space:nowrap}</style>${cells}`);
        await sheet.screenshot({ path: sheetFile, fullPage: true });
        await sheet.close();
      }
      perWidth.push({ width, stops, trapped, capped, sheet: shots.length ? sheetFile : null });
    }
    const all = perWidth.flatMap((p) => p.stops);
    const noIndicator = all.filter((s) => !s.indicator && !s.hidden).length;
    const hidden = all.filter((s) => s.hidden).length;
    const trapped = perWidth.some((p) => p.trapped);
    r.focus = { perWidth, noIndicator, hidden, trapped };
    add(
      "focus",
      route,
      trapped || hidden ? "FAIL" : noIndicator ? "WARN" : "PASS",
      perWidth.map((p) => `${p.width}: ${p.stops.length} stops${p.capped ? " (stopped at 200)" : ""}`).join(" · ") +
        ` · ${hidden} hidden while focused · ${noIndicator} without outline/ring (check the contact sheet)${trapped ? " · FOCUS TRAP" : ""}`,
    );
  }

  // ---------- headers ----------
  if (checks.has("headers")) {
    const res = await fetch(base + route);
    const h = Object.fromEntries(res.headers.entries());
    const csp = h["content-security-policy"] ?? "";
    const expect = [
      ["csp", "content-security-policy", !!csp],
      ["hsts", "strict-transport-security", !!h["strict-transport-security"]],
      ["nosniff", "x-content-type-options: nosniff", h["x-content-type-options"] === "nosniff"],
      ["referrer", "referrer-policy", !!h["referrer-policy"]],
      ["permissions", "permissions-policy", !!h["permissions-policy"]],
      ["clickjacking", "clickjacking (x-frame-options or frame-ancestors)", !!h["x-frame-options"] || /frame-ancestors/.test(csp)],
      ["no-powered-by", "no x-powered-by", !h["x-powered-by"]],
    ];
    r.headers = { present: h, expect: expect.map(([id, name, ok]) => ({ id, name, ok })) };
    const missing = expect.filter(([, , ok]) => !ok).map(([, n]) => n);
    add("headers", route, missing.length ? "FAIL" : "PASS", missing.length ? `missing: ${missing.join("; ")}` : "all present");
  }

  // ---------- capture (design fidelity vs the screens/ export) ----------
  if (checks.has("capture")) {
    const original = originals.get(route);
    const capture = path.join(cwd, ".claude/skills/screen-to-nextjs/scripts/capture.mjs");
    if (!original || !fs.existsSync(original)) {
      add("capture", route, "SKIP", original ? `design export not found: ${original}` : "no design export for this route (--original)");
    } else {
      const slug = route === "/" ? "home" : route.replace(/^\/|\/$/g, "").replace(/\//g, "_");
      const capOut = path.join(outDir, `capture-${slug}`);
      spawnSync(process.execPath, [capture, "--original", original, "--url", base + route, "--out", capOut, "--widths", widths], { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
      const repFile = path.join(capOut, "report.json");
      if (!fs.existsSync(repFile)) {
        add("capture", route, "SKIP", "capture.mjs produced no report");
      } else {
        const rep = JSON.parse(fs.readFileSync(repFile, "utf8"));
        const perWidth = Object.entries(rep.widths).map(([w, sides]) => {
          const o = sides.original?.landmarks ?? [];
          const c = sides.converted?.landmarks ?? [];
          const drift = o.map((a, i) => (c[i] ? Math.abs(c[i].height - a.height) / Math.max(a.height, 1) : 1));
          return {
            width: Number(w),
            board: sides.original?.board,
            countMatch: o.length === c.length,
            maxDriftPct: Math.round(Math.max(0, ...drift) * 1000) / 10,
            maxPixelDiff: Math.max(0, ...c.map((x) => x.diffPct ?? 0)),
            overflow: sides.converted?.horizontalOverflowPx ?? 0,
            errors: sides.converted?.errors?.length ?? 0,
          };
        });
        r.capture = { perWidth, report: path.join(capOut, "report.md") };
        const hard = perWidth.some((p) => !p.countMatch || p.overflow > 0 || p.errors > 0);
        const soft = perWidth.some((p) => p.maxDriftPct > 4 || p.maxPixelDiff > 5);
        add("capture", route, hard ? "FAIL" : soft ? "WARN" : "PASS", perWidth.map((p) => `${p.width}: drift ≤${p.maxDriftPct}% diff ≤${p.maxPixelDiff}%${p.countMatch ? "" : " landmark count differs"}${p.overflow ? ` overflow ${p.overflow}px` : ""}`).join(" · "));
      }
    }
  }

  // ---------- lighthouse ----------
  if (checks.has("lighthouse")) {
    r.lighthouse = {};
    const slug = route === "/" ? "home" : route.replace(/^\/|\/$/g, "").replace(/\//g, "_");
    for (const mode of modes) {
      let l = lighthouse(route, mode, path.join(outDir, `lighthouse-${slug}-${mode}.json`));
      if (l.error) {
        add(`lighthouse ${mode}`, route, "SKIP", `lighthouse failed: ${l.error}`);
        continue;
      }
      // One slow localhost run isn't a regression: when a run looks worse than the baseline
      // (or ran at a different machine speed), measure again. Keep the better run among those
      // at a comparable speed, or the better of both if neither was.
      const verdict = (x) => (baselineBefore ? compare(metricsOf({ results: { [route]: { lighthouse: { [mode]: x } } } }), baselineBefore) : { regressions: [], incomparable: [] });
      const suspect = (v) => v.regressions.length + v.incomparable.length > 0;
      if (suspect(verdict(l))) {
        const again = lighthouse(route, mode, path.join(outDir, `lighthouse-${slug}-${mode}-2.json`));
        if (!again.error) {
          const both = [l, again];
          const comparable = both.filter((x) => !verdict(x).incomparable.length);
          const pool = comparable.length ? comparable : both;
          l = pool.reduce((a, x) => (x.scores.perf > a.scores.perf ? x : a));
          l.runs = both.map((x) => `perf ${x.scores.perf} at CPU ${x.benchmarkIndex ?? "?"}`);
        }
      }
      const b = budgets[mode];
      const over = [];
      for (const k of ["perf", "a11y", "bp", "seo"]) if (l.scores[k] < b[k]) over.push(`${k} ${l.scores[k]} < ${b[k]}`);
      for (const k of ["lcp", "cls", "tbt"]) if (l.metrics[k] > b[k]) over.push(`${k} ${l.metrics[k]} > ${b[k]}`);
      r.lighthouse[mode] = { ...l, overBudget: over };
      const { scores, metrics } = l;
      add(`lighthouse ${mode}`, route, over.length ? "FAIL" : "PASS", `perf ${scores.perf} a11y ${scores.a11y} bp ${scores.bp} seo ${scores.seo} · LCP ${metrics.lcp}ms CLS ${metrics.cls} TBT ${metrics.tbt}ms · CPU benchmark ${l.benchmarkIndex ?? "?"}${l.runs ? ` (2 runs: ${l.runs.join(", ")})` : ""}${over.length ? ` · over budget: ${over.join(", ")}` : ""}`);
    }
  }
}

await browser?.close();
stop();

// ---------- baseline ----------
let regressions = [];
let incomparable = [];
const baselineMd = [];
if (baselineFile) {
  const current = metricsOf(report);
  let action = "compared";
  if (opt("phase")) {
    const res = record(load(baselineFile), current, { phase: opt("phase"), reset: flag("reset-baseline") });
    save(baselineFile, res.baseline);
    ({ regressions, incomparable, action } = res);
  } else if (baselineBefore) {
    ({ regressions, incomparable } = compare(current, baselineBefore));
  } else {
    action = "no baseline yet";
  }
  report.regressions = regressions;
  report.incomparable = incomparable;
  const note = { created: "baseline created", ok: "no regressions, baseline updated", regressed: "baseline left as it was", compared: "compared only (no --phase)", "no baseline yet": `nothing to compare: ${baselineFile} doesn't exist` }[action];
  const speed = incomparable.length ? ` · ${incomparable.length} Lighthouse value(s) not comparable (machine speed changed)${action === "ok" ? ", re-based" : ""}` : "";
  add("regressions", routes.join(", "), regressions.length ? "FAIL" : incomparable.length ? "WARN" : "PASS", `${regressions.length} vs baseline${speed} · ${note}`);
  if (regressions.length) baselineMd.push(``, `## Regressions vs baseline`, ...regressions.map((r) => `- ${describe(r)}`));
  if (incomparable.length) baselineMd.push(``, `## Not comparable (machine speed changed)`, ...incomparable.map((r) => `- ${describe(r)}`));
}

// ---------- markdown ----------
const icon = { PASS: "✅", WARN: "⚠️", FAIL: "❌", SKIP: "⏭️" };
md.push(`| check | route | result | notes |`, `|---|---|---|---|`);
for (const s of summary) md.push(`| ${s.check} | ${s.route} | ${icon[s.status]} ${s.status} | ${s.note} |`);
md.push(...baselineMd);

for (const [route, r] of Object.entries(report.results)) {
  if (r.console?.length) {
    md.push(``, `## Console / network: ${route}`);
    for (const e of r.console.slice(0, 20)) md.push(`- [${e.width}] ${e.kind}: \`${e.text.replace(/`/g, "'")}\``);
  }
  if (r.capture) {
    md.push(``, `## Design capture: ${route}`, `| width | compared with board | landmarks match | max height drift | max pixel diff | overflow | errors |`, `|---|---|---|---|---|---|---|`);
    for (const p of r.capture.perWidth) md.push(`| ${p.width} | ${p.board ?? "?"} | ${p.countMatch ? "yes" : "NO"} | ${p.maxDriftPct}% | ${p.maxPixelDiff}% | ${p.overflow}px | ${p.errors} |`);
    md.push(`- Per-section table and side-by-side pairs: \`${r.capture.report}\` (pairs/ next to it). Deliberate deviations (a phone-width fix when there is no mobile board, a landmark the mobile board leaves out) show up as drift, so check them against the converter's report.`);
  }
  if (r.sweep && (r.sweep.failingWidths || r.sweep.textSpacingIssues)) {
    md.push(``, `## Responsive sweep: ${route}`);
    for (const p of r.sweep.perWidth.filter((x) => x.overflow || x.offenders.length)) {
      md.push(`- ${p.width}px: ${p.overflow ? `page scrolls sideways by ${p.overflow}px` : "content cut off at the edge"}${p.offenders.length ? `; outermost: ${p.offenders.map((o) => `\`${o}\``).join(", ")}` : ""}`);
    }
    for (const t of r.sweep.textSpacing.filter((x) => x.overflow || x.clippedCount)) {
      md.push(`- text spacing at ${t.width}px:${t.overflow ? ` scrolls sideways by ${t.overflow}px;` : ""}${t.clippedCount ? ` ${t.clippedCount} text box(es) cut off: ${t.clipped.map((c) => `\`${c}\``).join(", ")}` : ""}`);
    }
    md.push(`- 320px must not scroll sideways (WCAG 1.4.10). Widths between the design boards have no design to compare with, so fix these from the nearest board's layout.`);
  }
  if (r.focus) {
    const flagged = r.focus.perWidth.flatMap((p) => p.stops.map((s, i) => ({ ...s, n: i + 1, width: p.width }))).filter((s) => s.hidden || !s.indicator);
    md.push(``, `## Focus walk: ${route}`);
    for (const p of r.focus.perWidth) md.push(`- ${p.width}px: ${p.stops.length} Tab stops${p.trapped ? ", **focus trap** (Tab came back to an earlier stop)" : ""}${p.sheet ? ` · contact sheet \`${p.sheet}\`` : ""}`);
    for (const s of flagged.slice(0, 15)) md.push(`  - [${s.width}] ${s.n}. \`${s.name}\` "${s.label}": ${s.hidden ? `**${s.hidden}** while focused` : "no outline or ring (a background/underline change can still be a valid indicator: check the sheet)"}`);
    if (flagged.length > 15) md.push(`  - … ${flagged.length - 15} more in audit.json`);
  }
  if (r.links?.broken.length) {
    md.push(``, `## Broken links: ${route}`);
    for (const l of r.links.broken) md.push(`- \`${l.href}\`: ${l.problem}`);
  }
  if (r.axe?.violations.length) {
    md.push(``, `## axe violations: ${route}`);
    for (const v of r.axe.violations) {
      md.push(`- **${v.id}** (${v.impact}, at ${[...new Set(v.widths)].join("/")}px): ${v.help}`);
      for (const n of v.nodes.slice(0, 3)) md.push(`  - \`${n.target}\`${n.summary ? `: ${n.summary}` : ""}`);
    }
  }
  if (r.headers) {
    const missing = r.headers.expect.filter((e) => !e.ok);
    if (missing.length) md.push(``, `## Security headers: ${route}`, ...missing.map((e) => `- missing/wrong: ${e.name}`));
  }
  for (const [mode, l] of Object.entries(r.lighthouse ?? {})) {
    md.push(``, `## Lighthouse ${mode}: ${route}`);
    md.push(`- Scores: perf ${l.scores.perf} · a11y ${l.scores.a11y} · best-practices ${l.scores.bp} · seo ${l.scores.seo}`);
    md.push(`- LCP ${l.metrics.lcp}ms · CLS ${l.metrics.cls} · TBT ${l.metrics.tbt}ms · FCP ${l.metrics.fcp}ms`);
    if (l.runs) md.push(`- Measured twice because the first run looked like a regression or ran at a different machine speed (${l.runs.join("; ")}); these numbers are from the run kept.`);
    if (l.lcpElement) md.push(`- LCP element: \`${l.lcpElement.replace(/`/g, "'")}\``);
    for (const c of l.lcpChecklist) md.push(`- LCP discovery: ${c.ok ? "✅" : "❌"} ${c.label}`);
    if (l.failing.length) {
      md.push(`- Failing audits:`);
      for (const f of l.failing) md.push(`  - ${f.title}${f.value ? ` (${f.value})` : ""}${f.expectedOnLocalhost ? " · expected on localhost, ignore" : ""}`);
    }
    md.push(`- Full report: \`${l.report}\``);
  }
}
md.push(``, `Lighthouse on localhost varies ±5 points run to run; re-run before chasing a small miss.`);

fs.writeFileSync(path.join(outDir, "audit.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outDir, "audit.md"), md.join("\n"));
console.log(md.join("\n"));
process.exit((flag("strict") && summary.some((s) => s.status === "FAIL")) || regressions.length ? 1 : 0);
