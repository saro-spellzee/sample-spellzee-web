import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { notFound } from "../../src/features/errors/content";

const MISSING = "/no-such-page";

const horizontalOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

/** Whether a console message came from the missing page's own document (Firefox gives some messages no URL). */
function fromMissingDocument(url: string): boolean {
  try {
    return new URL(url).pathname === MISSING;
  } catch {
    return false;
  }
}

test.describe("404 page", () => {
  test.use({ reducedMotion: "reduce" });

  test("an unknown URL answers 404 with the branded page, and nothing scrolls sideways at 320px", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      // Chromium logs the 404 response of the document itself; anything else is a real error.
      const theDocument404 = /\b404\b/.test(msg.text()) && fromMissingDocument(msg.location().url);
      if (!theDocument404) errors.push(`console: ${msg.text()} (${msg.location().url})`);
    });

    const response = await page.goto(MISSING);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: notFound.heading })).toBeVisible();
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
    await expect(page.getByRole("link", { name: notFound.home.label })).toHaveAttribute("href", notFound.home.href);

    await page.setViewportSize({ width: 320, height: 640 });
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test("its booking CTA leads to the homepage's booking section", async ({ page }) => {
    await page.goto(MISSING);
    await page.getByRole("link", { name: notFound.cta.label }).click();
    await expect(page).toHaveURL(/\/#book$/);
    await expect(page.locator("#book")).toBeInViewport();
  });
});
