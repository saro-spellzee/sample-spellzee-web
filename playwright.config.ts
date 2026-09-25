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
    // iPhone Safari's engine (npx playwright install webkit). Specs import `test` from
    // tests/e2e/fixtures.ts, which works around WebKit upgrading localhost requests to https.
    { name: "iphone", use: { ...devices["iPhone 15"], channel: undefined } },
    { name: "firefox", use: { ...devices["Desktop Firefox"], channel: undefined } },
  ],
  // Tests run against the production build (`npm run build` first; gates.mjs does this).
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    // Never deliver to a real list or CRM from E2E: a set env var beats .env.local.
    env: { NEWSLETTER_WEBHOOK_URL: "", LEADS_WEBHOOK_URL: "" },
  },
});
