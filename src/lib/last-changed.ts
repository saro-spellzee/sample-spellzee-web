import { execFileSync } from "node:child_process";

/**
 * When any of `paths` (relative to the project root) last changed, from git history. Build time
 * only (sitemap.ts is generated at build).
 *
 * A sitemap's lastmod should be the date of the page's last real change. `new Date()` claims the
 * page changed on every deploy, and search engines learn to ignore a lastmod that's always "now".
 * Returns undefined when git or the history isn't available (e.g. a build without `.git`); the
 * sitemap then leaves lastmod out rather than guess. A shallow clone gives the clone's newest
 * commit date, which is early enough to be true.
 */
export function lastChanged(...paths: string[]): Date | undefined {
  try {
    const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...paths], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 10_000,
    }).trim();
    const date = new Date(iso);
    return iso && !Number.isNaN(date.getTime()) ? date : undefined;
  } catch {
    return undefined;
  }
}
