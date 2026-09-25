import { test as base, type Page } from "@playwright/test";

/**
 * Shared `test` for every E2E spec: import `test` and `expect` from here, not from
 * "@playwright/test".
 *
 * - WebKit (the iPhone project) applies the CSP's `upgrade-insecure-requests` even on
 *   http://localhost, which Chromium exempts, so every asset would be requested over https
 *   and fail. For WebKit only, drop that one directive from document responses; the rest of
 *   the policy stays enforced. Production is served over https, where the directive is harmless.
 * - `page.goto` waits for the document to finish loading (read from the page: Firefox can fail
 *   to report its load event under load) and then for React to hydrate. A click that lands
 *   before hydration is lost (WebKit doesn't replay it), which made interaction tests race the
 *   JS bundle.
 */
const hydrated = (page: Page) =>
  page
    .waitForFunction(() => Object.keys(document.body).some((k) => k.startsWith("__reactFiber")), null, { timeout: 15_000 })
    .catch(() => {}); // not a React page (a text or image route): nothing to wait for

// The fixture callbacks are named `provide`, not Playwright's usual `use`: the React hooks
// lint rule mistakes any function called `use` for the React hook.
export const test = base.extend({
  context: async ({ context, browserName }, provide) => {
    if (browserName === "webkit") {
      await context.route("**/*", async (route) => {
        // A policy applies from the document's own response, so only documents need rewriting. Every
        // other request goes straight through: proxying each image and script via route.fetch cost
        // memory and time under load, and a reset connection on one image failed the whole test.
        if (route.request().resourceType() !== "document") return route.continue();
        const response = await route.fetch();
        const headers = response.headers();
        const csp = headers["content-security-policy"];
        if (csp) headers["content-security-policy"] = csp.replace(/;?\s*upgrade-insecure-requests/g, "");
        await route.fulfill({ response, headers });
      });
    }
    await provide(context);
  },
  page: async ({ page, javaScriptEnabled }, provide) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      // With JavaScript off (the pre-hydration tests) nothing will ever hydrate, and the page can't
      // be polled: keep Playwright's own wait.
      if (javaScriptEnabled === false) return goto(url, options);
      // Firefox, when the machine is busy, sometimes never reports the load event although the page
      // has loaded (seen: document.readyState "complete", nothing pending, goto still waiting at 30s).
      // So by default wait for the document itself rather than for that report.
      const response = await goto(url, { waitUntil: "commit", ...options });
      if (!options?.waitUntil) await page.waitForFunction(() => document.readyState === "complete", null, { polling: 100 });
      await hydrated(page);
      return response;
    };
    await provide(page);
  },
});

export { expect } from "@playwright/test";
