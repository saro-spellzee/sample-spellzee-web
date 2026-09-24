import { test as base, type Page } from "@playwright/test";

/**
 * Shared `test` for every E2E spec: import `test` and `expect` from here, not from
 * "@playwright/test".
 *
 * - WebKit (the iPhone project) applies the CSP's `upgrade-insecure-requests` even on
 *   http://localhost, which Chromium exempts, so every asset would be requested over https
 *   and fail. For WebKit only, drop that one directive from responses; the rest of the
 *   policy stays enforced. Production is served over https, where the directive is harmless.
 * - `page.goto` waits for React to hydrate the page. A click that lands before hydration is
 *   lost (WebKit doesn't replay it), which made interaction tests race the JS bundle.
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
        const response = await route.fetch();
        const headers = response.headers();
        const csp = headers["content-security-policy"];
        if (csp) headers["content-security-policy"] = csp.replace(/;?\s*upgrade-insecure-requests/g, "");
        await route.fulfill({ response, headers });
      });
    }
    await provide(context);
  },
  page: async ({ page }, provide) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      await hydrated(page);
      return response;
    };
    await provide(page);
  },
});

export { expect } from "@playwright/test";
