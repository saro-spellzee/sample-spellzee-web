#!/usr/bin/env node
// Run state for the ship-screen pipeline, kept in .quality/<screen>/run.json so a
// run can be resumed (--from) and ends with one REPORT.md.
//
//   node state.mjs init   <screen> --route / [--base <sha>] [--branch <name>] [--flags "..."]
//   node state.mjs start  <screen> <phase>
//   node state.mjs set    <screen> <phase> <pass|partial|fail|skipped> [--note "..."] [--commit <sha>]
//   node state.mjs next   <screen>            → prints the first phase not yet done
//   node state.mjs report <screen>            → writes .quality/<screen>/REPORT.md and prints it
//   node state.mjs phases                     → prints the phase registry

import fs from "node:fs";
import path from "node:path";
import { load as loadBaseline, trendMarkdown } from "./baseline.mjs";

// Perf runs after security and errors so it measures the page with its final headers,
// error boundaries and form code (a security header once cost mobile perf ~26 points).
export const PHASES = [
  { n: 0, id: "preflight", title: "Pre-flight", owner: "orchestrator", blocking: true },
  { n: 1, id: "convert", title: "Convert design → code", owner: "screen-converter", blocking: true },
  { n: 2, id: "build", title: "Build gate", owner: "orchestrator", blocking: true },
  { n: 3, id: "tests", title: "Tests", owner: "test-engineer", blocking: false },
  { n: 4, id: "structure", title: "Structure, tokens, types", owner: "architecture-auditor", blocking: false },
  { n: 5, id: "a11y", title: "Accessibility", owner: "a11y-auditor", blocking: false },
  { n: 6, id: "seo", title: "SEO / GEO / AEO", owner: "seo-auditor", blocking: false },
  { n: 7, id: "forms", title: "Forms", owner: "form-auditor", blocking: false },
  { n: 8, id: "security", title: "Security", owner: "security-auditor", blocking: false },
  { n: 9, id: "errors", title: "Error handling", owner: "error-handling-auditor", blocking: false },
  { n: 10, id: "perf", title: "Performance", owner: "perf-auditor", blocking: false },
  { n: 11, id: "review", title: "Code review", owner: "code-reviewer", blocking: false },
  { n: 12, id: "final", title: "Final regression", owner: "orchestrator", blocking: true },
  { n: 13, id: "report", title: "Report", owner: "orchestrator", blocking: false },
];

const [cmd, screen, ...rest] = process.argv.slice(2);
const opt = (n) => {
  const i = rest.indexOf(`--${n}`);
  return i >= 0 ? rest[i + 1] : undefined;
};
const dir = screen ? path.join(".quality", screen) : "";
const file = dir && path.join(dir, "run.json");
const load = () => JSON.parse(fs.readFileSync(file, "utf8"));
const save = (s) => fs.writeFileSync(file, JSON.stringify(s, null, 2));
const now = () => new Date().toISOString();
const DONE = new Set(["pass", "partial", "skipped"]);

switch (cmd) {
  case "phases":
    for (const p of PHASES) console.log(`${String(p.n).padStart(2)}  ${p.id.padEnd(10)} ${p.title.padEnd(26)} ${p.owner}${p.blocking ? "  (blocking)" : ""}`);
    break;

  case "init": {
    fs.mkdirSync(dir, { recursive: true });
    const prev = fs.existsSync(file) ? load() : null;
    const s = {
      screen,
      route: opt("route") ?? prev?.route ?? "/",
      branch: opt("branch") ?? prev?.branch ?? "",
      base: opt("base") ?? prev?.base ?? "",
      flags: opt("flags") ?? prev?.flags ?? "",
      startedAt: prev?.startedAt ?? now(),
      resumedAt: prev ? now() : undefined,
      phases: Object.fromEntries(PHASES.map((p) => [p.id, prev?.phases?.[p.id] ?? { status: "pending" }])),
    };
    save(s);
    console.log(`${prev ? "resumed" : "initialised"} ${file}`);
    break;
  }

  case "start": {
    const s = load();
    s.phases[rest[0]] = { ...s.phases[rest[0]], status: "running", startedAt: now() };
    save(s);
    break;
  }

  case "set": {
    const [phase, status] = rest;
    const s = load();
    const p = s.phases[phase] ?? {};
    s.phases[phase] = { ...p, status, note: opt("note") ?? p.note ?? "", commit: opt("commit") ?? p.commit, finishedAt: now() };
    save(s);
    console.log(`${phase}: ${status}`);
    break;
  }

  case "next": {
    const s = load();
    const next = PHASES.find((p) => !DONE.has(s.phases[p.id]?.status));
    console.log(next ? `${next.n} ${next.id}` : "done");
    break;
  }

  case "report": {
    const s = load();
    const icon = { pass: "✅", partial: "🟡", fail: "❌", skipped: "⏭️", pending: "·", running: "…" };
    const trend = trendMarkdown(loadBaseline(path.join(dir, "baseline.json")));
    const md = [
      `# ship-screen report: ${s.screen}`,
      ``,
      `- Route: \`${s.route}\` · branch: \`${s.branch}\` · base: \`${s.base.slice(0, 8)}\``,
      `- Started: ${s.startedAt}${s.resumedAt ? ` · resumed: ${s.resumedAt}` : ""} · finished: ${now()}`,
      ...(s.flags ? [`- Flags: ${s.flags}`] : []),
      ``,
      `| # | phase | result | commit | notes |`,
      `|---|---|---|---|---|`,
      ...PHASES.map((p) => {
        const r = s.phases[p.id] ?? { status: "pending" };
        return `| ${p.n} | ${p.title} | ${icon[r.status] ?? ""} ${r.status} | ${r.commit ? `\`${r.commit.slice(0, 8)}\`` : ""} | ${(r.note ?? "").replace(/\|/g, "/")} |`;
      }),
      ``,
      ...(trend ? [trend] : []),
      `Phase reports: \`${dir.replace(/\\/g, "/")}/NN-<phase>.md\`. Audit, capture and Lighthouse output are in the same folder.`,
    ];
    fs.writeFileSync(path.join(dir, "REPORT.md"), md.join("\n"));
    console.log(md.join("\n"));
    break;
  }

  default:
    console.error("usage: state.mjs <init|start|set|next|report|phases> <screen> ...");
    process.exit(1);
}
