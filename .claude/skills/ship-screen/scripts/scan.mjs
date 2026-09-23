#!/usr/bin/env node
// Static code scan for the ship-screen pipeline: facts the structure, security
// and review phases need, gathered the same way every time. It reports; the
// phase agent judges (a hex code inside tones.ts is fine, one inside a section isn't).
//
// Usage (from the project root):
//   node .claude/skills/ship-screen/scripts/scan.mjs [--paths src/features/homepage,src/components] [--out file.md] [--json file.json]

import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const opt = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : d;
};
const roots = opt("paths", "src").split(",").map((p) => p.trim()).filter(Boolean);
const MAX_LINES = 200;

const files = [];
const walk = (p) => {
  if (!fs.existsSync(p)) return;
  const st = fs.statSync(p);
  if (st.isDirectory()) for (const f of fs.readdirSync(p)) walk(path.join(p, f));
  else if (/\.(tsx?|mjs|js)$/.test(p) && !/\.d\.ts$/.test(p)) files.push(p.replace(/\\/g, "/"));
};
roots.forEach(walk);

// next/og image routes legitimately use raw <img> and inline styles.
const isOgFile = (f) => /\/(opengraph-image|twitter-image|icon|apple-icon)\.tsx$|\/_og\//.test(f);
const isTest = (f) => /\.(test|spec)\.tsx?$|\/tests?\//.test(f);

const findings = {
  bigFiles: [], clientFiles: [], hex: [], anyTypes: [], suppressions: [], dangerousHtml: [],
  inlineStyles: [], crossFeature: [], uiImportsFeature: [], blankTargets: [], envInClient: [],
  rawImg: [], consoleLogs: [], literalText: [], forms: [],
};

for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const lines = src.split(/\r?\n/);
  const isClient = /^\s*["']use client["']/m.test(src.slice(0, 200));
  const at = (i) => `${f}:${i + 1}`;
  if (lines.length > MAX_LINES && !isTest(f)) findings.bigFiles.push(`${f} (${lines.length} lines)`);
  if (isClient) findings.clientFiles.push(f);

  const feature = (f.match(/src\/features\/([^/]+)\//) || [])[1];
  lines.forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, "");
    if (/\.tsx$/.test(f) && !isOgFile(f) && /#[0-9a-fA-F]{3,8}\b/.test(code) && !/^\s*(\*|\/\*)/.test(line)) findings.hex.push(`${at(i)}  ${line.trim().slice(0, 110)}`);
    if (/(:\s*any\b|<any>|\bas any\b|any\[\])/.test(code)) findings.anyTypes.push(`${at(i)}  ${line.trim().slice(0, 110)}`);
    if (/@ts-ignore|@ts-expect-error|eslint-disable(?!-next-line @next\/next\/no-img-element)/.test(line)) findings.suppressions.push(`${at(i)}  ${line.trim().slice(0, 110)}`);
    if (/dangerouslySetInnerHTML/.test(code)) findings.dangerousHtml.push(at(i));
    if (/style=\{\{/.test(code) && !isOgFile(f)) findings.inlineStyles.push(`${at(i)}  ${line.trim().slice(0, 110)}`);
    const imp = code.match(/from\s+["']([^"']+)["']/);
    if (imp) {
      const target = imp[1];
      const other = (target.match(/(?:@\/features\/|\.\.\/\.\.\/features\/)([^/]+)/) || [])[1];
      if (feature && other && other !== feature) findings.crossFeature.push(`${at(i)}  imports ${target}`);
      if (/src\/components\//.test(f) && /@\/features\//.test(target)) findings.uiImportsFeature.push(`${at(i)}  imports ${target}`);
    }
    if (/target=["']_blank["']/.test(code) && !/noopener|noreferrer/.test(code)) findings.blankTargets.push(at(i));
    const env = code.match(/process\.env\.([A-Z0-9_]+)/g);
    if (isClient && env) for (const e of env) if (!/NEXT_PUBLIC_|NODE_ENV/.test(e)) findings.envInClient.push(`${at(i)}  ${e} (undefined in the browser; server-only secret?)`);
    if (/<img\b/.test(code) && !isOgFile(f)) findings.rawImg.push(at(i));
    if (/console\.log\(/.test(code) && !isTest(f)) findings.consoleLogs.push(at(i));
    // Heuristic: visible text written straight into JSX (should come from content.ts).
    if (/\.tsx$/.test(f) && !isOgFile(f) && !isTest(f) && />\s*[A-Za-z][A-Za-z ,.'’!?-]{6,}\s*</.test(code)) findings.literalText.push(`${at(i)}  ${line.trim().slice(0, 110)}`);
    if (/<(form|input|textarea|select)\b/.test(code)) findings.forms.push(`${at(i)}  ${line.trim().slice(0, 80)}`);
  });
}

const sections = [
  ["bigFiles", `Files over ${MAX_LINES} lines (split unless pure data)`],
  ["clientFiles", `"use client" files (should be interactive leaves only)`],
  ["hex", "Raw hex colours in TSX (should be @theme tokens or tones)"],
  ["anyTypes", "`any` types"],
  ["suppressions", "Type/lint suppressions"],
  ["dangerousHtml", "dangerouslySetInnerHTML (must be escaped JSON-LD or sanitized)"],
  ["inlineStyles", "Inline style props (OK only for continuous values / CSS variables)"],
  ["crossFeature", "Cross-feature imports (feature A importing feature B)"],
  ["uiImportsFeature", "components/ importing from features/ (wrong dependency direction)"],
  ["blankTargets", 'target="_blank" without rel="noopener noreferrer"'],
  ["envInClient", "Non-public env vars read in client components"],
  ["rawImg", "Raw <img> (use next/image)"],
  ["consoleLogs", "console.log left in code"],
  ["literalText", "Possible hard-coded UI text in JSX (should come from content.ts)"],
  ["forms", "Form controls (non-empty → the forms phase runs)"],
];

const md = [`# Code scan`, ``, `Scanned ${files.length} files under ${roots.join(", ")}.`, ``, `| check | count |`, `|---|---|`];
for (const [k, title] of sections) md.push(`| ${title} | ${findings[k].length} |`);
for (const [k, title] of sections) {
  if (!findings[k].length) continue;
  md.push(``, `## ${title}`);
  for (const item of findings[k].slice(0, 40)) md.push(`- ${item}`);
  if (findings[k].length > 40) md.push(`- … ${findings[k].length - 40} more`);
}

const text = md.join("\n");
if (opt("out")) {
  fs.mkdirSync(path.dirname(opt("out")), { recursive: true });
  fs.writeFileSync(opt("out"), text);
}
if (opt("json")) fs.writeFileSync(opt("json"), JSON.stringify(findings, null, 2));
console.log(text);
