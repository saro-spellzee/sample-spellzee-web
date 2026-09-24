import axe from "axe-core";

/**
 * axe-core violations for a rendered component, as readable strings so a failing
 * `expect(...).toEqual([])` prints what's wrong. jsdom has no layout or paint, so
 * colour contrast is left to the browser audit (audit.mjs / Lighthouse).
 */
export async function axeViolations(container: Element): Promise<string[]> {
  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  return results.violations.map((v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}
