import { expect, test, type Page } from "@playwright/test";
import { classroom, clm, faq, footer, header, hero, stories } from "../../src/features/homepage/content";

/**
 * Programme pages the homepage links to that haven't been built yet. Next prefetches
 * them when their links scroll into view, so they 404 in the console.
 * TODO(product): remove each route here once its page ships; the "internal links"
 * test fails as a reminder when a listed route starts resolving.
 */
const UNBUILT_ROUTES = ["/phonics", "/comprehension", "/grammar-and-communication", "/public-speaking"];
const isUnbuilt = (url: string) => UNBUILT_ROUTES.includes(new URL(url).pathname);

/** Collects console errors, uncaught page errors and failed responses for the page's lifetime. */
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    const url = msg.location().url;
    if (msg.type() === "error" && !(url && isUnbuilt(url))) errors.push(`console: ${msg.text()} (${url})`);
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("response", (res) => {
    if (res.status() >= 400 && !isUnbuilt(res.url())) errors.push(`http ${res.status()}: ${res.url()}`);
  });
  return errors;
}

test.describe("homepage", () => {
  test("renders with an h1, no errors and no horizontal overflow", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Scroll the whole page so lazy images and in-view effects load.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      }
      window.scrollTo(0, document.body.scrollHeight);
    });
    await expect
      .poll(() => page.evaluate(() => [...document.images].filter((img) => !img.complete).length))
      .toBe(0);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test("primary CTA and in-page links point at real targets", async ({ page }) => {
    await page.goto("/");

    const cta = page.getByRole("link", { name: hero.primaryCta.label });
    await expect(cta).toHaveAttribute("href", hero.primaryCta.href);

    const hashes = await page.$$eval("a[href^='#']", (links) => [...new Set(links.map((a) => a.getAttribute("href")!))]);
    expect(hashes.length).toBeGreaterThan(0);
    for (const hash of hashes) {
      await expect(page.locator(hash), `${hash} has a target`).toHaveCount(1);
    }

    await cta.click();
    await expect(page).toHaveURL(new RegExp(`${hero.primaryCta.href}$`));
    await expect(page.locator(hero.primaryCta.href)).toBeInViewport();
  });

  test("internal page links resolve, apart from the listed unbuilt routes", async ({ page, request }) => {
    await page.goto("/");

    const paths = await page.$$eval("a[href^='/']", (links) => [...new Set(links.map((a) => a.getAttribute("href")!))]);
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      const status = (await request.get(path)).status();
      if (UNBUILT_ROUTES.includes(path)) expect(status, `${path} now resolves: remove it from UNBUILT_ROUTES`).toBe(404);
      else expect(status, `${path} resolves`).toBeLessThan(400);
    }
  });

  test("skip link is the first tab stop and moves focus to main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: header.skipLink.label });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();

    await page.keyboard.press("Enter");

    await expect(page.locator("main")).toBeFocused();
  });

  test("CLM skill map selects a skill", async ({ page }) => {
    await page.goto("/");
    const skill = clm.skills[2];
    // Scoped: the hero has a "Comprehension" tag button too.
    const pill = page.locator("#clm").getByRole("button", { name: skill.name, exact: true });

    await pill.click();

    await expect(pill).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(skill.description)).toBeVisible();
  });

  test("classroom activities: blend a word, switch tab and answer", async ({ page }) => {
    await page.goto("/");
    const { blend, read } = classroom;
    const word = blend.words[0];

    for (const part of word.parts) {
      await page.getByRole("button", { name: blend.soundLabel.replace("{sound}", part), exact: true }).click();
    }
    await expect(page.getByText(blend.success.replace("{word}", word.word))).toBeVisible();

    await page.getByRole("tab", { name: classroom.tabs[1] }).click();
    await page.getByRole("button", { name: read.options[read.correctIndex] }).click();
    await expect(page.getByText(read.right)).toBeVisible();
  });

  test("story picker features the chosen story", async ({ page }) => {
    await page.goto("/");
    const story = stories.items[1];
    const button = page.getByRole("button", { name: story.quote });

    await button.click();

    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("p[aria-live]", { hasText: story.quote })).toBeVisible();
  });

  test("FAQ opens a question and closes the previous one", async ({ page }) => {
    await page.goto("/");
    const first = page.getByRole("button", { name: faq.items[0].question });
    const second = page.getByRole("button", { name: faq.items[1].question });

    await second.click();

    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByText(faq.items[1].answer)).toBeVisible();
  });

  test("newsletter shows a linked error for an invalid email", async ({ page }) => {
    await page.goto("/");
    const input = page.getByLabel(footer.newsletter.label);

    await input.fill("not-an-email");
    await page.getByRole("button", { name: footer.newsletter.submit }).click();

    await expect(page.getByText(footer.newsletter.errors.invalid)).toBeVisible();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toBeFocused();
  });

  // The E2E server is a production build with no NEWSLETTER_WEBHOOK_URL, so the Server
  // Action must fail loudly: a generic error, the email kept, and never a fake "subscribed".
  test("newsletter never claims success in production when no webhook is configured", async ({ page }) => {
    test.skip(!!process.env.NEWSLETTER_WEBHOOK_URL, "a webhook is configured for this run");
    await page.goto("/");
    const input = page.getByLabel(footer.newsletter.label);

    await input.fill("parent@example.com");
    await input.press("Enter");

    await expect(page.getByRole("status").filter({ hasText: footer.newsletter.errors.failed })).toBeVisible();
    await expect(page.getByText(footer.newsletter.success)).toHaveCount(0);
    await expect(input).toHaveValue("parent@example.com");
  });
});
