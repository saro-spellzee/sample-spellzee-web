# One-time tooling setup (pre-flight)

Pre-flight checks for these and installs whatever is missing, once per repo, then
commits it as `chore: add test and audit tooling`. Everything below was verified
together on this stack (Next 16.3, React 19.2, Node 24, Windows): `npm test`,
`npm run test:e2e`, `tsc` and `lint` all green.

## Packages

```bash
# @playwright/test must be the SAME version as the `playwright` already in devDependencies.
npm i -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom \
  @playwright/test@<playwright version> axe-core
```

- **ERESOLVE on `@types/node`**: Vitest 5 wants `@types/node` ^22 or ≥24. Align it with
  the Node major actually in use (`node -v`): `npm i -D @types/node@^24`. Next 16
  supports Node ≥20.9, so this is safe.
- Don't add `vite-tsconfig-paths`: Vite 8 resolves tsconfig paths natively (`resolve.tsconfigPaths`).
- Browsers: `npx playwright install chromium` if the network allows. If not, the config below
  falls back to the machine's Chrome automatically; nothing else to do.
- `npm warn allow-scripts … unrs-resolver` is harmless (an eslint dependency's postinstall).

## package.json scripts

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test"
```

## vitest.config.mts

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    restoreMocks: true,
  },
});
```

## tests/setup.ts

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest doesn't run Testing Library's auto-cleanup without `globals: true`.
afterEach(() => cleanup());
```

## tests/axe.ts (component-level a11y assertions)

```ts
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
```

## playwright.config.ts

```ts
import fs from "node:fs";
import { chromium, defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
// Use Playwright's own Chromium when it's installed, otherwise the machine's Chrome.
const channel = process.env.PW_CHANNEL || (fs.existsSync(chromium.executablePath()) ? undefined : "chrome");

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure", channel },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel } },
  ],
  // Tests run against the production build (`npm run build` first; gates.mjs does this).
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

`gates.mjs` sets `CI=1`, so E2E never reuses a stray dev server on port 3100: stop anything
listening there first.

## .gitignore additions

```
# ship-screen pipeline output + Playwright artefacts
/.quality/
/test-results/
/playwright-report/
```

## eslint.config.mjs ignores

Add to the existing `globalIgnores([...])` list, or lint crawls generated reports
(Playwright's HTML report is minified JS: hundreds of errors and a slow lint):

```js
".quality/**",
"test-results/**",
"playwright-report/**",
```

## Where tests live

- Component/integration tests: next to the component, `Name.test.tsx` (co-located, per
  `component-architecture`). Import the a11y helper with a relative path to `tests/axe.ts`.
- E2E: `tests/e2e/<screen>.spec.ts`, one file per screen.
- Vitest can't render `async` Server Components. Test those through E2E; unit-test the
  synchronous and client components.
