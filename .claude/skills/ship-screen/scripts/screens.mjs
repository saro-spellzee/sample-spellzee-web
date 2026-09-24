#!/usr/bin/env node
// The screens this site has already converted, so a run on one screen can prove it didn't
// break the others through shared code (layout, components/ui, globals.css, next.config).
//
//   node screens.mjs list                     → converted screens: screen, route, design export
//   node screens.mjs all                      → audit.mjs arguments for every converted screen (CI)
//   node screens.mjs others <screen>          → audit.mjs arguments for every other converted
//                                               screen; prints nothing when there are none
//   node screens.mjs shared-changes <screen>  → uncommitted changes that can reach other
//                                               routes; prints nothing when there are none
//
// A screen counts as converted when both screens/<name>/ and src/features/<name>/ exist
// (screens/<name>-mobile/ and similar are boards of <name>, not screens). Its route is the
// one a pipeline run recorded in .quality/<name>/run.json, else the pre-flight rule:
// homepage → /, any other name → /<name> in kebab-case.
//
// Routes are printed without the leading slash ("home" = /) because Git Bash rewrites an
// argument that starts with "/" into a Windows path; audit.mjs accepts both forms.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const BOARD_SUFFIX = /-(mobile|phone|tablet|desktop)$/i;
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
const posix = (p) => p.split(path.sep).join("/");

export function convertedScreens(cwd = process.cwd()) {
  const screensDir = path.join(cwd, "screens");
  if (!fs.existsSync(screensDir)) return [];
  const names = fs.readdirSync(screensDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  return names
    .filter((n) => !(BOARD_SUFFIX.test(n) && names.includes(n.replace(BOARD_SUFFIX, ""))))
    .filter((n) => fs.existsSync(path.join(cwd, "src", "features", n)))
    .map((screen) => {
      let route;
      try {
        route = JSON.parse(fs.readFileSync(path.join(cwd, ".quality", screen, "run.json"), "utf8")).route;
      } catch {}
      route ??= screen === "homepage" ? "/" : `/${kebab(screen)}`;
      const main = path.join("screens", screen, "Main.dc.html");
      return { screen, route, original: posix(fs.existsSync(path.join(cwd, main)) ? main : path.join("screens", screen)) };
    });
}

const argRoute = (route) => (route === "/" ? "home" : route.replace(/^\//, ""));

/** Files changed in the working tree (vs HEAD, plus untracked) that can affect routes other than this screen's. */
export function sharedChanges(screen, cwd = process.cwd()) {
  const me = convertedScreens(cwd).find((s) => s.screen === screen);
  const route = me?.route ?? (screen === "homepage" ? "/" : `/${kebab(screen)}`);
  const own = [
    `src/features/${screen}/`,
    `public/images/${screen}/`,
    route === "/" ? "src/app/page.tsx" : `src/app${route}/`,
  ];
  const ignored = [/^\.quality\//, /^\.claude\//, /^screens\//, /^tests\//, /\.(test|spec)\.[jt]sx?$/, /\.md$/, /^src\/app\/(sitemap|robots)\.ts$/, /^src\/app\/llms\.txt\//];
  const r = spawnSync("git", ["status", "--porcelain", "-uall"], { cwd, encoding: "utf8" });
  return (r.stdout ?? "")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => l.slice(3).replace(/^"|"$/g, "").split(" -> ").pop())
    .filter((f) => !own.some((o) => f === o || f.startsWith(o)) && !ignored.some((re) => re.test(f)));
}

// ---------- CLI ----------
const [cmd, screen] = import.meta.url === pathToFileURL(process.argv[1] ?? "").href ? process.argv.slice(2) : [];
if (!cmd) {
  // imported as a module
} else if (cmd === "list") {
  const all = convertedScreens();
  console.log(["| screen | route | design export |", "|---|---|---|", ...all.map((s) => `| ${s.screen} | ${s.route} | ${s.original} |`)].join("\n"));
} else if ((cmd === "others" && screen) || cmd === "all") {
  const list = convertedScreens().filter((s) => cmd === "all" || s.screen !== screen);
  if (list.length) {
    console.log(`--routes ${list.map((s) => argRoute(s.route)).join(",")} --original ${list.map((s) => `${argRoute(s.route)}=${s.original}`).join(",")}`);
  }
} else if (cmd === "shared-changes" && screen) {
  const files = sharedChanges(screen);
  if (files.length) console.log(files.join("\n"));
} else {
  console.error("usage: node screens.mjs list | all | others <screen> | shared-changes <screen>");
  process.exit(1);
}
