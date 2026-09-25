// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Pins the security headers in next.config.ts. The pipeline's header check only sees whether each
 * header is present; these tests fail if the policy itself is loosened (a wildcard, 'unsafe-eval' in
 * production, a missing lock-down directive). Adding a real third-party origin is fine: list it by
 * its full https:// origin in the directive that needs it.
 */

type Rule = { source: string; headers: { key: string; value: string }[] };

async function loadRules(nodeEnv?: string): Promise<{ rules: Rule[]; poweredByHeader?: boolean }> {
  vi.resetModules();
  if (nodeEnv) vi.stubEnv("NODE_ENV", nodeEnv);
  const { default: config } = await import("../../next.config");
  return { rules: (await config.headers!()) as Rule[], poweredByHeader: config.poweredByHeader };
}

const header = (rule: Rule, key: string) => rule.headers.find((h) => h.key.toLowerCase() === key.toLowerCase())?.value;

function directives(csp: string): Map<string, string[]> {
  return new Map(
    csp
      .split(";")
      .map((d) => d.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name, ...sources]) => [name, sources]),
  );
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("security headers (production build)", () => {
  it("sends every security header on every route, and no X-Powered-By", async () => {
    const { rules, poweredByHeader } = await loadRules();
    const all = rules.find((r) => r.source === "/:path*")!;
    expect(all).toBeDefined();
    expect(header(all, "Content-Security-Policy")).toBeTruthy();
    expect(header(all, "Strict-Transport-Security")).toMatch(/max-age=\d{8,}/);
    expect(header(all, "X-Content-Type-Options")).toBe("nosniff");
    expect(header(all, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(header(all, "X-Frame-Options")).toBe("DENY");
    expect(poweredByHeader).toBe(false);
  });

  it("keeps the CSP locked down: same-origin by default, no plugins, no framing, no injected handlers", async () => {
    const { rules } = await loadRules();
    const csp = directives(header(rules.find((r) => r.source === "/:path*")!, "Content-Security-Policy")!);
    expect(csp.get("default-src")).toEqual(["'self'"]);
    expect(csp.get("object-src")).toEqual(["'none'"]);
    expect(csp.get("base-uri")).toEqual(["'self'"]);
    expect(csp.get("form-action")).toEqual(["'self'"]);
    expect(csp.get("frame-ancestors")).toEqual(["'none'"]);
    expect(csp.get("script-src-attr")).toEqual(["'none'"]);
    expect(csp.has("upgrade-insecure-requests")).toBe(true);
    expect(csp.get("script-src")).not.toContain("'unsafe-eval'");
  });

  it("allows no wildcard, bare scheme or data:/blob: source anywhere in the site-wide CSP", async () => {
    const { rules } = await loadRules();
    const csp = directives(header(rules.find((r) => r.source === "/:path*")!, "Content-Security-Policy")!);
    for (const [name, sources] of csp) {
      for (const source of sources) {
        const ok = /^'(self|none|unsafe-inline)'$/.test(source) || /^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(source);
        expect(ok, `${name} ${source}`).toBe(true);
      }
    }
  });

  it("relaxes the sitemap's policy only by data: images (Chrome's XML viewer icons)", async () => {
    const { rules } = await loadRules();
    const site = header(rules.find((r) => r.source === "/:path*")!, "Content-Security-Policy")!;
    const sitemap = header(rules.find((r) => r.source === "/sitemap.xml")!, "Content-Security-Policy")!;
    const a = directives(site);
    const b = directives(sitemap);
    expect(b.get("img-src")).toEqual([...a.get("img-src")!, "data:"]);
    b.delete("img-src");
    a.delete("img-src");
    expect(b).toEqual(a);
  });

  it("turns off camera, microphone, geolocation and the prompt-less motion sensors", async () => {
    const { rules } = await loadRules();
    const policy = header(rules.find((r) => r.source === "/:path*")!, "Permissions-Policy")!;
    for (const feature of ["camera", "microphone", "geolocation", "accelerometer", "gyroscope", "magnetometer"]) {
      expect(policy).toContain(`${feature}=()`);
    }
  });
});

describe("security headers (next dev)", () => {
  it("adds 'unsafe-eval' (React's dev tooling) and drops upgrade-insecure-requests only in development", async () => {
    const { rules } = await loadRules("development");
    const csp = directives(header(rules.find((r) => r.source === "/:path*")!, "Content-Security-Policy")!);
    expect(csp.get("script-src")).toContain("'unsafe-eval'");
    expect(csp.has("upgrade-insecure-requests")).toBe(false);
  });
});
