#!/usr/bin/env node
// Regression baseline for the ship-screen pipeline, kept in .quality/<screen>/baseline.json.
// It holds the best value each tracked metric has reached during the run. After every
// phase the orchestrator's check (audit.mjs --baseline) compares against it, so a phase
// that breaks what an earlier phase got right is caught while its agent still has context,
// not in the final regression.
//
//   node baseline.mjs accept <audit.json> <baseline.json> --phase <id> --note "<why>"
//        → take this audit's values as the baseline, including the worse ones: a
//          trade-off that was decided (e.g. a security header that costs mobile perf)
//   node baseline.mjs show <baseline.json>   → current values and the per-phase trend
//
// audit.mjs imports metricsOf / compare / record from here.

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// [key pattern, which direction is better, how much worse it may get before it counts].
// The slack only covers measurement noise: localhost Lighthouse moves ±5 run to run, and
// a canvas frame can shift a capture's pixel diff a little.
const RULES = [
  [/^console\.errors$/, "lower", 0],
  [/^axe\.(serious|rules)$/, "lower", 0],
  [/^links\.broken$/, "lower", 0],
  [/^header\./, "higher", 0],
  [/^capture\.\d+\.(drift|diff)$/, "lower", 1.5],
  [/^capture\.\d+\.(landmarks|overflow|errors)$/, "lower", 0],
  [/^lh\.\w+\.perf$/, "higher", 8],
  [/^lh\.\w+\.seo$/, "higher", 0],
  [/^lh\.\w+\.lcp$/, "lower", 500],
  [/^lh\.\w+\.tbt$/, "lower", 250],
  [/^lh\.\w+\.cls$/, "lower", 0.05],
];
export const rule = (key) => {
  const r = RULES.find(([re]) => re.test(key));
  return r ? { better: r[1], slack: r[2] } : null;
};

// Lighthouse numbers depend on how fast the machine is at that moment, and a laptop's speed
// moves a lot (thermal throttling, power mode, background work): on this laptop its
// CPU benchmark index ranged ~930-2060, and mobile perf moved 16 points with no code change.
// Each Lighthouse value keeps the benchmark of the run that produced it, and a comparison
// only counts when both runs are within 15% of each other.
const CPU_TOLERANCE = 0.85;
const cpuOf = (metrics, key) => (key.startsWith("lh.") ? metrics[key.replace(/\.[^.]+$/, ".cpu")] : undefined);
const comparableCpu = (now, then) => !now || !then || (now / then >= CPU_TOLERANCE && then / now >= CPU_TOLERANCE);

/** Flattens audit.mjs results into { [route]: { [metric]: number } }. */
export function metricsOf(report) {
  const out = {};
  for (const [route, r] of Object.entries(report.results ?? {})) {
    const m = (out[route] = {});
    if (r.console) m["console.errors"] = r.console.filter((e) => e.kind !== "console.warning").length;
    if (r.axe) {
      m["axe.serious"] = r.axe.violations.filter((v) => ["critical", "serious"].includes(v.impact)).length;
      m["axe.rules"] = r.axe.violations.length;
    }
    if (r.links) m["links.broken"] = r.links.broken.length;
    for (const h of r.headers?.expect ?? []) m[`header.${h.id}`] = h.ok ? 1 : 0;
    for (const p of r.capture?.perWidth ?? []) {
      m[`capture.${p.width}.drift`] = p.maxDriftPct;
      m[`capture.${p.width}.diff`] = p.maxPixelDiff;
      m[`capture.${p.width}.landmarks`] = p.countMatch ? 0 : 1;
      m[`capture.${p.width}.overflow`] = p.overflow;
      m[`capture.${p.width}.errors`] = p.errors;
    }
    for (const [mode, l] of Object.entries(r.lighthouse ?? {})) {
      m[`lh.${mode}.perf`] = l.scores.perf;
      m[`lh.${mode}.seo`] = l.scores.seo;
      m[`lh.${mode}.lcp`] = l.metrics.lcp;
      m[`lh.${mode}.tbt`] = l.metrics.tbt;
      m[`lh.${mode}.cls`] = l.metrics.cls;
      if (l.benchmarkIndex) m[`lh.${mode}.cpu`] = l.benchmarkIndex;
    }
  }
  return out;
}

const worse = (key, now, best) => {
  const r = rule(key);
  if (!r || best === undefined) return false;
  return r.better === "lower" ? now > best + r.slack : now < best - r.slack;
};

/**
 * Metrics that got worse than the baseline by more than their slack. A worse Lighthouse
 * value from a run at a different machine speed goes to `incomparable` instead: it says
 * nothing about the code.
 */
export function compare(current, baseline) {
  const regressions = [];
  const incomparable = [];
  for (const [route, metrics] of Object.entries(current)) {
    for (const [key, now] of Object.entries(metrics)) {
      const best = baseline?.routes?.[route]?.[key];
      if (!best || !worse(key, now, best.value)) continue;
      const cpu = cpuOf(metrics, key);
      if (comparableCpu(cpu, best.cpu)) regressions.push({ route, key, before: best.value, now, setBy: best.phase });
      else incomparable.push({ route, key, before: best.value, now, cpuThen: best.cpu, cpuNow: cpu });
    }
  }
  return { regressions, incomparable };
}

export const load = (file) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null);

/**
 * Records one check in the baseline and returns it. Without regressions each metric keeps
 * its best value so far, and Lighthouse values that weren't comparable (machine speed
 * changed) are re-based on this run so later checks have something to compare with. With
 * `accept`, the current values replace the baseline even where they're worse. With
 * regressions (and no accept) the baseline stays as it was; only the history gets the
 * entry, so the trend shows what happened.
 */
export function record(baseline, current, { phase, note = "", accept = false, reset = false }) {
  const b = !baseline || reset ? { routes: {}, history: [] } : baseline;
  const { regressions, incomparable } = baseline && !reset ? compare(current, baseline) : { regressions: [], incomparable: [] };
  const action = !baseline || reset ? "created" : accept ? "accepted" : regressions.length ? "regressed" : "ok";
  if (action !== "regressed") {
    for (const [route, metrics] of Object.entries(current)) {
      const target = (b.routes[route] ??= {});
      for (const [key, value] of Object.entries(metrics)) {
        const prev = target[key];
        const r = rule(key);
        const better = !prev || !r || (r.better === "lower" ? value < prev.value : value > prev.value);
        const rebase = incomparable.some((i) => i.route === route && i.key === key);
        const cpu = cpuOf(metrics, key);
        if (accept || better || rebase) target[key] = { value, phase, ...(cpu ? { cpu } : {}) };
      }
    }
  }
  b.history.push({
    phase,
    at: new Date().toISOString(),
    action,
    note,
    regressions: regressions.map((r) => `${r.route} ${r.key}`),
    rebased: action === "regressed" ? [] : incomparable.map((i) => `${i.route} ${i.key}`),
    values: current,
  });
  return { baseline: b, regressions, incomparable, action };
}

export const save = (file, baseline) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(baseline, null, 2));
};

export const describe = (r) =>
  r.setBy !== undefined
    ? `\`${r.key}\` on ${r.route}: ${r.before} → ${r.now} (best set by ${r.setBy})`
    : `\`${r.key}\` on ${r.route}: ${r.before} → ${r.now}, but the machine ran at CPU benchmark ${r.cpuNow} vs ${r.cpuThen} (busy or throttled), so it doesn't count`;

// Headline metrics for the per-phase trend; others stay in baseline.json.
const TREND = [
  ["mobile perf", "lh.mobile.perf"],
  ["mobile TBT", "lh.mobile.tbt"],
  ["mobile LCP", "lh.mobile.lcp"],
  ["axe serious", "axe.serious"],
  ["console errors", "console.errors"],
  ["390 drift %", "capture.390.drift"],
];

/** Markdown: one row per recorded check, so a regression shows up next to the phase that caused it. */
export function trendMarkdown(baseline) {
  if (!baseline?.history?.length) return "";
  const routes = [...new Set(baseline.history.flatMap((h) => Object.keys(h.values)))];
  const md = [];
  for (const route of routes) {
    const cols = TREND.filter(([, k]) => baseline.history.some((h) => h.values[route]?.[k] !== undefined));
    md.push(`### Regression checks: ${route}`, ``, `| phase | result | ${cols.map(([t]) => t).join(" | ")} |`, `|---|---|${cols.map(() => "---|").join("")}`);
    for (const h of baseline.history.filter((x) => x.values[route])) {
      const mine = (list) => (list ?? []).filter((r) => r.startsWith(`${route} `)).map((r) => r.slice(route.length + 1));
      const rebased = mine(h.rebased).length ? ` (Lighthouse re-based: machine speed changed)` : "";
      const result = h.action === "regressed" ? `❌ ${mine(h.regressions).join(", ")}` : h.action === "accepted" ? `🟡 accepted: ${h.note}` : `✅ ${h.action}${rebased}`;
      md.push(`| ${h.phase} | ${result.replace(/\|/g, "/")} | ${cols.map(([, k]) => h.values[route][k] ?? "").join(" | ")} |`);
    }
    md.push(``);
  }
  return md.join("\n");
}

// ---------- CLI ----------
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [cmd, ...rest] = process.argv.slice(2);
  const opt = (n) => {
    const i = rest.indexOf(`--${n}`);
    return i >= 0 ? rest[i + 1] : undefined;
  };
  if (cmd === "accept" && rest[0] && rest[1] && opt("phase")) {
    const audit = JSON.parse(fs.readFileSync(rest[0], "utf8"));
    const { baseline, action } = record(load(rest[1]), metricsOf(audit), { phase: opt("phase"), note: opt("note") ?? "", accept: true });
    save(rest[1], baseline);
    console.log(`baseline ${action} from ${rest[0]}`);
  } else if (cmd === "show" && rest[0]) {
    const b = load(rest[0]);
    if (!b) {
      console.error(`no baseline at ${rest[0]}`);
      process.exit(1);
    }
    for (const [route, metrics] of Object.entries(b.routes)) {
      console.log(`## Baseline: ${route}`);
      for (const [k, v] of Object.entries(metrics)) console.log(`- ${k}: ${v.value} (${v.phase})`);
      console.log("");
    }
    console.log(trendMarkdown(b));
  } else {
    console.error('usage: baseline.mjs accept <audit.json> <baseline.json> --phase <id> --note "<why>"\n       baseline.mjs show <baseline.json>');
    process.exit(1);
  }
}
