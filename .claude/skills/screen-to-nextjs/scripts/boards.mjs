#!/usr/bin/env node
// Finds every design board of a screen and says which one is the reference at a given
// viewport width. A Claude Design canvas can hold several boards for one screen (desktop,
// tablet, mobile, plus state boards such as "menu open"). Each exported board is a
// *.dc.html file whose data-props $preview.width is the width it was drawn at.
//
// Given screens/<screen>/Main.dc.html (or the folder screens/<screen>), boards are found in:
//   screens/<screen>/*.dc.html             several boards in one export
//   screens/<screen>/<folder>/*.dc.html    a board exported on its own, e.g. mobile/
//   screens/<screen>-<band>/*.dc.html      a sibling export: -mobile, -phone, -tablet, -desktop
//
// Boards drawn at the same width (±8px) form a group: one reference board (the file you
// passed, else the shallowest Main.dc.html, else the first by path) plus state boards.
// A capture width is compared with the reference board whose width is nearest.
//
// Usage: node boards.mjs screens/<screen>[/Main.dc.html] [--widths 1440,1000,390]
// No dependencies; capture.mjs and inventory.mjs import it.

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SKIP_DIRS = new Set(["assets", "vendor", "node_modules"]);
const SIBLING_BANDS = new Set(["mobile", "phone", "tablet", "desktop"]);
const SAME_WIDTH_PX = 8;

export const rel = (file) => path.relative(process.cwd(), file).split(path.sep).join("/");

export const bandOf = (width) => (width == null ? "unknown" : width >= 1200 ? "desktop" : width >= 700 ? "tablet" : "phone");

function readBoard(file, screenDir) {
  const html = fs.readFileSync(file, "utf8");
  let width = null;
  let height = null;
  try {
    const preview = JSON.parse(html.match(/data-props='([^']+)'/)?.[1] ?? "{}").$preview;
    width = Number(preview?.width) || null;
    height = Number(preview?.height) || null;
  } catch {}
  const title = (html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "").replace(/\s+/g, " ").trim();
  const depth = path.relative(screenDir, file).split(path.sep).length - 1;
  return { file, width, height, title, band: bandOf(width), depth };
}

/** Every board of the screen, sorted widest first, each marked as a reference or a state board. */
export function findBoards(input) {
  const abs = path.resolve(input);
  const isDir = fs.statSync(abs).isDirectory();
  const screenDir = isDir ? abs : path.dirname(abs);
  const dcIn = (dir) =>
    fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".dc.html")).map((f) => path.join(dir, f)) : [];

  const files = [...dcIn(screenDir)];
  for (const d of fs.readdirSync(screenDir, { withFileTypes: true })) {
    if (d.isDirectory() && !SKIP_DIRS.has(d.name)) files.push(...dcIn(path.join(screenDir, d.name)));
  }
  const parent = path.dirname(screenDir);
  const prefix = `${path.basename(screenDir)}-`;
  for (const d of fs.readdirSync(parent, { withFileTypes: true })) {
    if (d.isDirectory() && d.name.startsWith(prefix) && SIBLING_BANDS.has(d.name.slice(prefix.length).toLowerCase())) {
      files.push(...dcIn(path.join(parent, d.name)));
    }
  }

  const boards = [...new Set(files)].map((f) => readBoard(f, screenDir));
  boards.sort((a, b) => (b.width ?? -1) - (a.width ?? -1) || a.depth - b.depth || rel(a.file).localeCompare(rel(b.file)));

  // Group by width; pick each group's reference board.
  const rank = (b) => [b.file === abs ? 0 : 1, path.basename(b.file) === "Main.dc.html" ? 0 : 1, b.depth, rel(b.file)];
  const cmp = (a, b) => {
    const [x, y] = [rank(a), rank(b)];
    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
    return 0;
  };
  const groups = [];
  for (const b of boards.filter((x) => x.width != null)) {
    const g = groups.find((x) => Math.abs(x[0].width - b.width) <= SAME_WIDTH_PX);
    g ? g.push(b) : groups.push([b]);
  }
  for (const g of groups) {
    const [ref, ...states] = [...g].sort(cmp);
    ref.role = "reference";
    for (const s of states) {
      s.role = "state";
      s.stateOf = ref.file;
    }
  }
  for (const b of boards.filter((x) => x.width == null)) b.role = "unknown width";

  // No board declares a width: fall back to the file that was passed (or the first board).
  if (!groups.length && boards.length) {
    const main = boards.find((b) => b.file === abs) ?? boards[0];
    main.role = "reference";
  }
  return { screenDir, boards };
}

export const references = ({ boards }) => boards.filter((b) => b.role === "reference");

/** The reference board to compare a viewport width with: nearest drawn width, ties to the wider board. */
export function boardFor(set, width) {
  const refs = references(set);
  if (refs.length === 1 || refs.every((b) => b.width == null)) return refs[0];
  return refs.reduce((best, b) => {
    const d = Math.abs(b.width - width);
    const bd = Math.abs(best.width - width);
    return d < bd || (d === bd && b.width > best.width) ? b : best;
  });
}

/** The desktop reference: the widest reference board. */
export const mainBoard = (set) => references(set)[0];

// ---------- CLI ----------
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2);
  const input = args.find((a) => !a.startsWith("--"));
  const wi = args.indexOf("--widths");
  const widths = (wi >= 0 ? args[wi + 1] : "1440,1000,390").split(",").map(Number);
  if (!input || !fs.existsSync(input)) {
    console.error("usage: node boards.mjs screens/<screen>[/Main.dc.html] [--widths 1440,1000,390]");
    process.exit(1);
  }
  const set = findBoards(input);
  const refs = references(set);
  const out = [`# Design boards: ${rel(set.screenDir)}`, ``, `| board | drawn at | band | role | title |`, `|---|---|---|---|---|`];
  for (const b of set.boards) {
    const role = b.role === "state" ? `state of ${rel(b.stateOf)}` : b.role;
    out.push(`| ${rel(b.file)} | ${b.width ?? "?"}×${b.height ?? "?"} | ${b.band} | ${role} | ${b.title.replace(/\|/g, "/")} |`);
  }
  out.push(``, `Capture widths → reference board: ${widths.map((w) => `${w} → ${rel(boardFor(set, w).file)}`).join(" · ")}`);
  const phone = refs.find((b) => b.band === "phone");
  const notes = [];
  if (!phone) notes.push(`No phone board: the phone layout comes from the desktop board's @media rules (screen-to-nextjs conventions §4).`);
  if (phone && widths.some((w) => w < 700) && !widths.includes(phone.width)) {
    notes.push(`The phone board is drawn at ${phone.width}px but captures run at ${widths.filter((w) => w < 700).join("/")}px, so small differences from the narrower or wider frame are expected.`);
  }
  for (const b of set.boards.filter((x) => x.role === "unknown width")) notes.push(`${rel(b.file)} has no $preview.width, so it isn't used for any width.`);
  if (set.boards.some((b) => b.role === "state")) notes.push(`State boards show one widget in another state (menu open, step 2, error). They are the spec for that state and are not captured.`);
  if (notes.length) out.push(``, ...notes.map((n) => `- ${n}`));
  console.log(out.join("\n"));
}
