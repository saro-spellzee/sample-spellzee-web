#!/usr/bin/env node
// Design review pack for the design team: one self-contained HTML file with every design
// board next to the built page (landmark by landmark, at each width), the state boards, the
// design copy that's missing on the page, and the open decisions and deliberate deviations,
// each with a sign-off box. Open it in a browser or print it; nothing else is needed.
//
//   node review-pack.mjs <screen> [--capture <dir with report.json>] [--decisions <file.md>] [--out <file.html>]
//
// Defaults: the newest .quality/<screen>/**/capture-*/report.json (the final audit's, at the end
// of a run), .quality/<screen>/DECISIONS.md, and .quality/<screen>/DESIGN-REVIEW.html.

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const screen = argv.find((a) => !a.startsWith("--"));
const opt = (n) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
if (!screen) {
  console.error("usage: node review-pack.mjs <screen> [--capture <dir>] [--decisions <file.md>] [--out <file.html>]");
  process.exit(1);
}
const q = path.join(".quality", screen);

function newestCapture() {
  const found = [];
  const walk = (dir, depth) => {
    if (!fs.existsSync(dir) || depth > 3) return;
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, d.name);
      if (d.isDirectory()) walk(p, depth + 1);
      else if (d.name === "report.json" && /capture/.test(path.basename(path.dirname(p)))) found.push(p);
    }
  };
  walk(q, 0);
  return found.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
}
const repFile = opt("capture") ? path.join(opt("capture"), "report.json") : newestCapture();
if (!repFile || !fs.existsSync(repFile)) {
  console.error(`No capture report found under ${q}. Run the audit with --original first (the final phase does).`);
  process.exit(1);
}
const rep = JSON.parse(fs.readFileSync(repFile, "utf8"));
const run = fs.existsSync(path.join(q, "run.json")) ? JSON.parse(fs.readFileSync(path.join(q, "run.json"), "utf8")) : {};
const decisionsFile = opt("decisions") ?? path.join(q, "DECISIONS.md");
const decisions = fs.existsSync(decisionsFile) ? fs.readFileSync(decisionsFile, "utf8") : "";
const outFile = opt("out") ?? path.join(q, "DESIGN-REVIEW.html");

// ---------- images: PNG screenshots → downscaled JPEG data URLs (keeps the file shareable) ----------
const req = createRequire(path.join(process.cwd(), "package.json"));
const { chromium } = req("playwright");
let browser;
for (const channel of [undefined, "chrome", "msedge"]) {
  try {
    browser = await chromium.launch(channel ? { channel } : {});
    break;
  } catch {}
}
if (!browser) {
  console.error("No browser could be launched. Run: npx playwright install chromium");
  process.exit(2);
}
const page = await browser.newPage();
async function jpeg(file, maxW) {
  if (!file || !fs.existsSync(file)) return "";
  const png = fs.readFileSync(file).toString("base64");
  return page.evaluate(
    async ({ png, maxW }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${png}`;
      await img.decode();
      const scale = Math.min(1, maxW / img.naturalWidth);
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(Math.min(img.naturalHeight * scale, 2400));
      c.getContext("2d").drawImage(img, 0, 0, img.naturalWidth * scale, img.naturalHeight * scale);
      return c.toDataURL("image/jpeg", 0.72);
    },
    { png, maxW },
  );
}

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const flagOf = (a, b) => {
  if (!a || !b) return "missing";
  const drift = Math.abs(b.height - a.height) / Math.max(a.height, 1);
  if (drift > 0.04) return `height ${b.height > a.height ? "+" : ""}${b.height - a.height}px (${Math.round(drift * 100)}%)`;
  if ((b.diffPct ?? 0) > 5) return `${b.diffPct}% of pixels differ`;
  return "";
};
let item = 0;
const signoff = () => `<div class="sign"><label><input type="checkbox"> OK as built</label><label><input type="checkbox"> Needs a change</label><span class="note">Note: ______________________</span></div>`;

async function pairsHtml(o, c, width, id) {
  const maxW = Math.min(width, 640);
  const rows = [];
  const flagged = [];
  for (let i = 0; i < Math.max(o.length, c.length); i++) {
    const a = o[i];
    const b = c[i];
    const flag = flagOf(a, b);
    const name = (a ?? b).tag + ((a ?? b).id ? `#${(a ?? b).id}` : "");
    const anchor = `${id}-${i + 1}`;
    item++;
    if (flag) flagged.push({ anchor, name, flag, n: item });
    rows.push(`<section class="pair${flag ? " flagged" : ""}" id="${anchor}">
      <h4><span class="n">${item}</span> ${esc(name)} <span class="h">${esc((a ?? b).heading)}</span>${flag ? `<span class="badge">${esc(flag)}</span>` : `<span class="ok">matches</span>`}</h4>
      <div class="cols"><figure><figcaption>Design board</figcaption>${a ? `<img src="${await jpeg(a.file, maxW)}" alt="">` : `<div class="miss">not on the board</div>`}</figure>
      <figure><figcaption>Built page</figcaption>${b ? `<img src="${await jpeg(b.file, maxW)}" alt="">` : `<div class="miss">not on the page</div>`}</figure></div>
      ${signoff()}</section>`);
  }
  return { html: rows.join("\n"), flagged };
}

const sections = [];
const lookFirst = [];
for (const [w, sides] of Object.entries(rep.widths ?? {})) {
  const o = sides.original?.landmarks ?? [];
  const c = sides.converted?.landmarks ?? [];
  if (!o.length || !c.length) continue;
  const { html, flagged } = await pairsHtml(o, c, Number(w), `w${w}`);
  lookFirst.push(...flagged.map((f) => ({ ...f, where: `${w}px` })));
  const copy = sides.copy;
  if (copy?.missing?.length) lookFirst.push({ anchor: `copy-${w}`, name: "copy", flag: `${copy.missing.length} line(s) of design copy not on the page`, where: `${w}px` });
  const copyHtml = copy
    ? `<div class="copy" id="copy-${w}"><h4>Copy at ${w}px</h4>
       <p>${copy.checked} lines of design copy checked: <b>${copy.missing.length} missing on the page</b>, ${copy.extra.length} on the page but not on the board (often fine: a skip link, a screen-reader label, a form message).</p>
       ${copy.missing.length ? `<ul>${copy.missing.map((m) => `<li><code>${esc(m.landmark)}</code> "${esc(m.text)}"</li>`).join("")}</ul>${signoff()}` : ""}
       ${copy.extra.length ? `<details><summary>On the page only (${copy.extra.length})</summary><ul>${copy.extra.map((m) => `<li><code>${esc(m.landmark)}</code> "${esc(m.text)}"</li>`).join("")}</ul></details>` : ""}</div>`
    : "";
  sections.push(`<h2 id="w${w}">${w}px · compared with <code>${esc(sides.original?.board ?? "")}</code></h2>${copyHtml}${html}`);
}
for (const [name, s] of Object.entries(rep.states ?? {})) {
  if (s.failed) lookFirst.push({ anchor: `state-${name}`, name, flag: `state couldn't be reproduced: ${s.failed}`, where: `${s.width}px` });
  if (!s.original || !s.converted) {
    sections.push(`<h2 id="state-${esc(name)}">State: ${esc(name)}</h2><p class="miss">${esc(s.failed ?? "not captured")}</p>`);
    continue;
  }
  const { html, flagged } = await pairsHtml(s.original.landmarks, s.converted.landmarks, s.width, `state-${name}`);
  lookFirst.push(...flagged.map((f) => ({ ...f, where: `state ${name}` })));
  sections.push(`<h2 id="state-${esc(name)}">State: ${esc(name)} · <code>${esc(s.board)}</code> at ${s.width}px</h2>${s.failed ? `<p class="miss">${esc(s.failed)}</p>` : ""}${html}`);
}
await browser.close();

// Minimal markdown: headings, bullets, paragraphs, `code`, **bold**.
const md = (text) => {
  const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  const out = [];
  let list = false;
  for (const line of text.split(/\r?\n/)) {
    const bullet = line.match(/^\s*[-*]\s+(.*)/);
    if (bullet) {
      if (!list) out.push("<ul>");
      list = true;
      out.push(`<li>${inline(bullet[1])}${signoff()}</li>`);
      continue;
    }
    if (list) out.push("</ul>");
    list = false;
    const h = line.match(/^(#{1,4})\s+(.*)/);
    if (h) out.push(`<h${h[1].length + 2}>${inline(h[2])}</h${h[1].length + 2}>`);
    else if (line.trim()) out.push(`<p>${inline(line)}</p>`);
  }
  if (list) out.push("</ul>");
  return out.join("\n");
};

const boards = (rep.boards ?? []).map((b) => `<li><code>${esc(b.board)}</code> · ${esc(b.band)} · drawn at ${b.width}px</li>`).join("");
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Design review: ${esc(screen)}</title>
<style>
:root{--ink:#0e1a3a;--muted:#5b6480;--line:#e3e8f4;--bg:#fcfbf8;--card:#fff;--warn:#b45309;--warn-bg:#fff4e0;--ok:#047857}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1400px;margin:0 auto;padding:24px 16px 64px}h1{margin:0 0 4px;font-size:28px}h2{margin:40px 0 12px;padding-top:16px;border-top:2px solid var(--line);font-size:21px}
.meta{color:var(--muted)}code{font-size:.9em;background:#eef1f8;padding:1px 5px;border-radius:4px}
.first{background:var(--warn-bg);border:1px solid #f6d7a7;border-radius:12px;padding:12px 18px}.first li{margin:4px 0}
.pair{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;margin:14px 0;break-inside:avoid}.pair.flagged{border-color:#f0b35a;box-shadow:0 0 0 2px #fde7c2}
.pair h4{margin:0 0 10px;font-size:15px;display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}.n{background:var(--ink);color:#fff;border-radius:99px;padding:0 8px;font-size:12px}.h{color:var(--muted);font-weight:400}
.badge{background:var(--warn-bg);color:var(--warn);border-radius:99px;padding:1px 10px;font-size:12px}.ok{color:var(--ok);font-size:12px;font-weight:400}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0;min-width:0}figcaption{font-size:12px;color:var(--muted);margin-bottom:4px}img{display:block;max-width:100%;height:auto;border:1px solid var(--line)}
.miss{padding:24px;background:#fdecec;color:#9b1c1c;border-radius:8px}.sign{display:flex;gap:18px;flex-wrap:wrap;margin-top:10px;font-size:13px;color:var(--muted)}.note{flex:1;min-width:200px}
.copy{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 16px;margin:12px 0}
@media (max-width:700px){.cols{grid-template-columns:1fr}}@media print{body{background:#fff}.pair{box-shadow:none}}
</style></head><body><main>
<h1>Design review: ${esc(screen)}</h1>
<p class="meta">Route <code>${esc(run.route ?? "")}</code> · branch <code>${esc(run.branch ?? "")}</code> · generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} · from <code>${esc(repFile.replace(/\\/g, "/"))}</code></p>
${boards ? `<p>Design boards:</p><ul>${boards}</ul>` : ""}
<p>Each section shows the design board on the left and the built page on the right, section by section. Tick one box per item. Items that differ noticeably are listed first.</p>
<div class="first"><h3>Look at these first (${lookFirst.length})</h3>${lookFirst.length ? `<ol>${lookFirst.map((f) => `<li><a href="#${esc(f.anchor)}">${esc(f.where)} · ${esc(f.name)}</a>: ${esc(f.flag)}</li>`).join("")}</ol>` : "<p>Nothing differs noticeably. A quick scroll through is still worth it.</p>"}</div>
${decisions ? `<h2 id="decisions">Decisions and deliberate deviations</h2>${md(decisions)}` : ""}
${sections.join("\n")}
</main></body></html>`;
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, html);
console.log(`wrote ${outFile} (${Math.round(fs.statSync(outFile).size / 1024)} KB, ${item} items, ${lookFirst.length} to look at first)`);
