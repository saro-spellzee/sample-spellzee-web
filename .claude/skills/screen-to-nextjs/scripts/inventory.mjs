#!/usr/bin/env node
// Builds a conversion map of a Claude Design (x-dc) export so the converter
// starts from facts instead of skimming a 100KB+ file.
//
// Usage: node inventory.mjs screens/<screen>/Main.dc.html [--out inventory.md]
//
// No dependencies. Regex-based on purpose: x-dc exports are machine-generated
// and regular enough that this is reliable, and it keeps the script portable.

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const outIdx = args.indexOf("--out");
const outFile = outIdx >= 0 ? args[outIdx + 1] : null;
if (!file) {
  console.error("usage: node inventory.mjs <Main.dc.html> [--out inventory.md]");
  process.exit(1);
}

const html = fs.readFileSync(file, "utf8");
const dir = path.dirname(file);
const lineOf = (idx) => html.slice(0, idx).split("\n").length;
const out = [];
const p = (s = "") => out.push(s);

// ---------- head ----------
const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
const fontLinks = [...html.matchAll(/href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"/g)].map((m) => m[1]);
const fonts = fontLinks.flatMap((u) =>
  [...u.replace(/&amp;/g, "&").matchAll(/family=([^&:]+)(?::([^&]+))?/g)].map(
    (m) => `${decodeURIComponent(m[1]).replace(/\+/g, " ")}${m[2] ? ` (${m[2]})` : ""}`
  )
);
const preview = (html.match(/data-props='([^']+)'/) || [])[1];

p(`# Inventory: ${path.basename(dir)}/${path.basename(file)}`);
p();
p(`- Title: ${title ?? "(none)"}`);
if (preview) p(`- Design preview size: ${preview}`);
p(`- Google fonts: ${fonts.join("; ") || "(none)"}`);
p(`- Size: ${html.length} chars, ${html.split("\n").length} lines`);
p();

// ---------- helmet <style> ----------
const styleBlocks = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)];
const css = styleBlocks.map((m) => m[1]).join("\n");
const styleLine = styleBlocks[0] ? lineOf(styleBlocks[0].index) : "?";
p(`## Stylesheet (helmet <style>, starts line ${styleLine})`);
const keyframes = [...css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)].map((m) => m[1]);
p(`- @keyframes (${keyframes.length}): ${keyframes.join(", ")}`);
const medias = [...css.matchAll(/@media\s*([^{]+)\{/g)].map((m) => m[1].trim());
p(`- @media: ${[...new Set(medias)].join(" | ") || "(none)"}`);
const classNames = [...new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]))];
p(`- Custom classes (${classNames.length}): ${classNames.join(" ")}`);
p();

// ---------- tokens (frequency across the whole file) ----------
const freq = (re, src = html) => {
  const m = new Map();
  for (const x of src.matchAll(re)) {
    const k = x[1] ?? x[0];
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};
const fmt = (entries, n) => entries.slice(0, n).map(([k, v]) => `\`${k}\`×${v}`).join(", ");
p(`## Token candidates (most frequent first; frequent values become @theme tokens)`);
const hex = freq(/#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b/g).map(([k, v]) => [k.toUpperCase(), v]);
const hexMerged = [...hex.reduce((m, [k, v]) => m.set(k, (m.get(k) || 0) + v), new Map())].sort((a, b) => b[1] - a[1]);
p(`- Hex colors (${hexMerged.length} distinct): ${fmt(hexMerged, 40)}`);
p(`- rgba colors: ${fmt(freq(/rgba\([\d.\s,%]+\)/g), 20)}`);
p(`- font-size: ${fmt(freq(/font-size:\s*([\d.]+(?:px|rem|em))/g), 25)}`);
p(`- font-weight: ${fmt(freq(/font-weight:\s*(\d+)/g), 10)}`);
// CSS values end at ; " } or newline (inline styles and the helmet stylesheet differ)
const cssVal = (prop) => new RegExp(`${prop}:\\s*([^;"}\\n]+)`, "g");
p(`- border-radius: ${fmt(freq(cssVal("border-radius")), 15)}`);
p(`- letter-spacing: ${fmt(freq(cssVal("letter-spacing")), 10)}`);
const shadows = freq(cssVal("box-shadow"));
p(`- box-shadow (distinct: ${shadows.length}): ${fmt(shadows, 8)}`);
p(`- max-width (container candidates): ${fmt(freq(cssVal("max-width")), 10)}`);
p(`- gradients: ${freq(/(linear|radial)-gradient\(/g).map(([k, v]) => `${k}×${v}`).join(", ")}`);
p();

// ---------- landmarks ----------
// Top-level header/section/footer blocks, each with the dynamic bits inside it.
function blocks() {
  const res = [];
  const re = /<(header|section|footer)\b([^>]*)>/g;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1];
    // find the matching close tag by depth counting on the same tag name
    const tagRe = new RegExp(`<(/?)${tag}\\b[^>]*>`, "g");
    tagRe.lastIndex = m.index;
    let depth = 0, end = html.length, t;
    while ((t = tagRe.exec(html))) {
      depth += t[1] ? -1 : 1;
      if (depth === 0) { end = t.index + t[0].length; break; }
    }
    res.push({ tag, attrs: m[2], start: m.index, end });
    re.lastIndex = end; // skip nested landmarks
  }
  return res;
}
const attr = (attrs, name) => (attrs.match(new RegExp(`\\b${name}="([^"]*)"`)) || [])[1];
const uniq = (a) => [...new Set(a)];

p(`## Page landmarks (in render order)`);
p(`Each is a candidate section component. Lines refer to ${path.basename(file)}.`);
p();
blocks().forEach((b, i) => {
  const body = html.slice(b.start, b.end);
  const id = attr(b.attrs, "id");
  const cls = attr(b.attrs, "class");
  const heading = (body.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/) || [])[1];
  const headingText = heading ? heading.replace(/<[^>]+>/g, " ").replace(/\{\{[^}]*\}\}/g, "…").replace(/\s+/g, " ").trim().slice(0, 90) : "";
  p(`### ${i + 1}. <${b.tag}>${id ? ` #${id}` : ""}${cls ? ` .${cls.split(/\s+/).join(".")}` : ""} — lines ${lineOf(b.start)}–${lineOf(b.end)} (${body.split("\n").length} lines)`);
  if (headingText) p(`- Heading: "${headingText}"`);
  const loops = [...body.matchAll(/<sc-for\s+list="\{\{\s*([^}]+?)\s*\}\}"\s+as="(\w+)"/g)].map((m) => `${m[1]} as ${m[2]}`);
  if (loops.length) p(`- sc-for: ${loops.join("; ")}`);
  const ifs = [...body.matchAll(/<sc-if\s+([^>]*)>/g)].map((m) => m[1].replace(/\s+/g, " ").slice(0, 80));
  if (ifs.length) p(`- sc-if: ${ifs.join("; ")}`);
  const handlers = uniq([...body.matchAll(/\bon([A-Z]\w+)="\{\{\s*([^}]+?)\s*\}\}"/g)].map((m) => `on${m[1]}→${m[2]}`));
  if (handlers.length) p(`- handlers: ${handlers.join("; ")}  → needs a client component`);
  const refs = uniq([...body.matchAll(/\bref="\{\{\s*([^}]+?)\s*\}\}"/g)].map((m) => m[1]));
  if (refs.length) p(`- refs: ${refs.join(", ")}`);
  if (/<canvas\b/.test(body)) p(`- contains <canvas> → imperative drawing, port as a client hook`);
  const anims = uniq([...body.matchAll(/animation:\s*([\w-]+)/g)].map((m) => m[1]).filter((a) => keyframes.includes(a)));
  const usedCls = classNames.filter((c) => new RegExp(`class="[^"]*\\b${c}\\b`).test(body));
  if (usedCls.length) p(`- custom classes used: ${usedCls.join(" ")}`);
  if (anims.length) p(`- inline animations: ${anims.join(", ")}`);
  const assets = uniq([...body.matchAll(/assets\/([\w.-]+)/g)].map((m) => m[1]));
  if (assets.length) p(`- assets: ${assets.join(", ")}`);
  const binds = uniq([...body.matchAll(/\{\{\s*([A-Za-z_$][\w$]*)/g)].map((m) => m[1]));
  if (binds.length) p(`- data bindings (roots): ${binds.join(", ")}`);
  p();
});

// ---------- logic class ----------
const scriptM = html.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/);
if (scriptM) {
  const js = scriptM[1];
  const sLine = lineOf(scriptM.index);
  p(`## Logic class (script starts line ${sLine})`);
  const state = (js.match(/this\.state\s*=\s*(\{[^;]+\})/) || [])[1];
  if (state) p(`- Initial state: \`${state.replace(/\s+/g, " ")}\``);
  const methods = uniq([...js.matchAll(/^\s{2}(\w+)\s*\([^)]*\)\s*\{/gm)].map((m) => m[1]));
  p(`- Methods: ${methods.join(", ")}`);
  const consts = uniq([...js.matchAll(/^\s*const\s+(\w+)\s*=/gm)].map((m) => m[1]));
  p(`- Top-level/local consts (data + icon tables live here): ${consts.join(", ")}`);
  const setStates = uniq([...js.matchAll(/setState\(\{\s*([^}]+?)\s*\}/g)].map((m) => m[1].replace(/\s+/g, " ").slice(0, 70)));
  p(`- setState calls: ${setStates.join(" | ")}`);
  const browser = ["requestAnimationFrame", "IntersectionObserver", "addEventListener", "getContext", "matchMedia", "setTimeout", "setInterval", "ResizeObserver", "devicePixelRatio"].filter((k) => js.includes(k));
  p(`- Browser APIs used: ${browser.join(", ") || "(none)"}`);
  p();
}

// ---------- assets ----------
function imageSize(fp) {
  const b = fs.readFileSync(fp);
  if (b[0] === 0x89 && b.toString("ascii", 1, 4) === "PNG") return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b[0] === 0xff && b[1] === 0xd8) {
    let o = 2;
    while (o < b.length) {
      if (b[o] !== 0xff) { o++; continue; }
      const marker = b[o + 1];
      const len = b.readUInt16BE(o + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return [b.readUInt16BE(o + 7), b.readUInt16BE(o + 5)];
      o += 2 + len;
    }
  }
  if (fp.endsWith(".svg")) {
    const s = b.toString("utf8");
    const vb = s.match(/viewBox="([\d.\s-]+)"/);
    if (vb) { const [, , w, h] = vb[1].trim().split(/\s+/).map(Number); return [w, h]; }
  }
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return ["webp", "?"];
  return ["?", "?"];
}
const assetDir = path.join(dir, "assets");
if (fs.existsSync(assetDir)) {
  p(`## Assets (name them by role when copying to public/)`);
  p(`| file | size | KB | used at lines | context |`);
  p(`|---|---|---|---|---|`);
  for (const f of fs.readdirSync(assetDir)) {
    const fp = path.join(assetDir, f);
    const [w, h] = imageSize(fp);
    const kb = Math.round(fs.statSync(fp).size / 1024);
    const uses = [...html.matchAll(new RegExp(f.replace(/\./g, "\\."), "g"))];
    const lines = uses.map((u) => lineOf(u.index));
    const ctx = uses[0]
      ? (() => {
          const i = uses[0].index;
          const around = html.slice(Math.max(0, i - 200), i);
          const alt = (html.slice(i, i + 300).match(/alt="([^"]*)"/) || [])[1];
          const cls = (around.match(/\.([\w-]+)\{[^}]*$/) || around.match(/class="([^"]*)"[^<]*$/) || [])[1];
          return [alt && `alt="${alt}"`, cls && `in .${cls}`].filter(Boolean).join(" ") || "";
        })()
      : "UNUSED";
    p(`| ${f} | ${w}×${h} | ${kb} | ${lines.join(", ") || "-"} | ${ctx} |`);
  }
  p();
}

// ---------- inline SVG icons ----------
const svgs = html.match(/<svg\b/g)?.length ?? 0;
const iconTable = /const\s+I\s*=\s*\{/.test(html);
p(`## Icons`);
p(`- Inline <svg> elements in markup: ${svgs}`);
if (iconTable) p(`- Logic class defines an icon table \`I\` (keys referenced as I.<name>) → becomes an Icon component with a typed name union`);

const text = out.join("\n");
if (outFile) {
  fs.writeFileSync(outFile, text);
  console.log(`wrote ${outFile}`);
} else console.log(text);
