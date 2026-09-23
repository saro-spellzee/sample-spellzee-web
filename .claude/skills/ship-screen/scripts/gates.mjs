#!/usr/bin/env node
// Build gate for the ship-screen pipeline: typegen → tsc → lint → build
// (→ unit tests → e2e tests with --tests). Prints a short markdown summary and
// exits 1 if any gate fails, so every phase can prove it left the tree green.
//
// Usage (from the project root):
//   node .claude/skills/ship-screen/scripts/gates.mjs [--tests] [--no-build] [--out <file.md>]

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
const scripts = pkg.scripts ?? {};

const steps = [
  { name: "typegen", cmd: "npx next typegen" },
  { name: "typecheck", cmd: "npx tsc --noEmit" },
  { name: "lint", cmd: "npm run lint" },
];
if (!flag("no-build")) steps.push({ name: "build", cmd: "npm run build" });
if (flag("tests")) {
  if (scripts.test) steps.push({ name: "unit tests", cmd: "npm test" });
  else steps.push({ name: "unit tests", skip: "no `test` script in package.json" });
  if (scripts["test:e2e"]) steps.push({ name: "e2e tests", cmd: "npm run test:e2e" });
  else steps.push({ name: "e2e tests", skip: "no `test:e2e` script in package.json" });
}

// Keep the useful tail of noisy tool output: error lines first, then the last lines.
function digest(output, max = 25) {
  const lines = output.split(/\r?\n/).filter((l) => l.trim());
  const errors = lines.filter((l) => /error|failed|✗|×|FAIL|warning/i.test(l));
  const pick = errors.length ? errors : lines;
  return pick.slice(-max).join("\n");
}

const results = [];
let routes = [];
for (const step of steps) {
  if (step.skip) {
    results.push({ name: step.name, status: "skipped", detail: step.skip });
    continue;
  }
  const t0 = Date.now();
  const r = spawnSync(step.cmd, { shell: true, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, env: { ...process.env, CI: "1", FORCE_COLOR: "0" } });
  const out = `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
  const ok = r.status === 0;
  if (step.name === "build" && ok) {
    // Route table lines look like "├ ○ /path" or "└ ƒ /api/x".
    routes = [...out.matchAll(/^[┌├└│ ]+([○●ƒλ◐])\s+(\S+)/gmu)].map((m) => ({ kind: m[1], route: m[2] }));
  }
  results.push({ name: step.name, status: ok ? "pass" : "fail", seconds: Math.round((Date.now() - t0) / 1000), detail: ok ? "" : digest(out) });
  if (!ok && ["typegen", "build"].includes(step.name)) break; // later gates are meaningless
}

const icon = { pass: "✅", fail: "❌", skipped: "⏭️" };
const lines = ["# Gates", "", "| gate | result | time |", "|---|---|---|"];
for (const r of results) lines.push(`| ${r.name} | ${icon[r.status]} ${r.status} | ${r.seconds ?? "-"}s |`);
if (routes.length) {
  const dynamic = routes.filter((r) => r.kind === "ƒ" || r.kind === "λ");
  lines.push("", `Routes: ${routes.length} (${routes.length - dynamic.length} static${dynamic.length ? `, dynamic: ${dynamic.map((r) => r.route).join(", ")}` : ""})`);
}
for (const r of results.filter((x) => x.status !== "pass" && x.detail)) {
  lines.push("", `## ${r.name}`, "```", r.detail, "```");
}
const failed = results.some((r) => r.status === "fail");
lines.push("", failed ? "**GATES FAILED**" : "**ALL GATES PASSED**");

const text = lines.join("\n");
const out = opt("out");
if (out) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, text);
}
console.log(text);
process.exit(failed ? 1 : 0);
