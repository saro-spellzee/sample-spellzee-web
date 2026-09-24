import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { booking, classroom, clm, faq, footer, header, hero, stories } from "../../src/features/homepage/content";

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
    // Every image in the page's width must load. The community marquee's repeat copies sit off to
    // the side and stay lazy until they drift into view (same URL as the visible copy), so skip those.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const width = document.documentElement.clientWidth;
          return [...document.images].filter((img) => {
            const r = img.getBoundingClientRect();
            const offCanvas = r.right <= 0 || r.left >= width;
            return !img.complete && !offCanvas;
          }).length;
        }),
      )
      .toBe(0);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test("in-page links point at real targets, and the primary CTA opens the booking dialog", async ({ page }) => {
    await page.goto("/");

    const cta = page.getByRole("link", { name: hero.primaryCta.label });
    // Without JavaScript the CTA still goes to the "How it works" section.
    await expect(cta).toHaveAttribute("href", hero.primaryCta.href);

    const hashes = await page.$$eval("a[href^='#']", (links) => [...new Set(links.map((a) => a.getAttribute("href")!))]);
    expect(hashes.length).toBeGreaterThan(0);
    for (const hash of hashes) {
      await expect(page.locator(hash), `${hash} has a target`).toHaveCount(1);
    }

    await cta.click();
    const dialog = page.getByRole("dialog", { name: booking.steps[0].title });
    await expect(dialog).toBeVisible();
    await expect(page).not.toHaveURL(/#book$/);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("booking dialog: both steps, then the confirmation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: hero.primaryCta.label }).click();
    const dialog = page.getByRole("dialog");

    await dialog.getByRole("button", { name: booking.continue }).click();
    await expect(dialog.getByRole("alert")).toHaveText(booking.errors.kid);

    await dialog.getByLabel(booking.kid.label).fill("Aarav");
    await dialog.getByLabel(booking.grade.label).fill("Grade 3");
    await dialog.getByRole("button", { name: /Comprehension/ }).click();
    await dialog.getByRole("button", { name: booking.continue }).click();

    await expect(dialog.getByRole("heading", { name: booking.steps[1].title })).toBeVisible();
    await dialog.getByLabel(booking.parent.label).fill("Meera Iyer");
    await dialog.getByLabel(booking.phone.label).fill("98765 43210");
    // Tap the drawn box, as a parent would: the native checkbox is visually hidden inside its label.
    const consent = dialog.getByRole("checkbox");
    await dialog.locator("label", { has: page.getByRole("checkbox") }).click({ position: { x: 11, y: 12 } });
    await expect(consent).toBeChecked();
    await dialog.getByRole("button", { name: new RegExp(booking.submit.call) }).click();

    await expect(dialog.getByRole("heading", { name: booking.done.title.replace("{parent}", "Meera") })).toBeVisible();
    await expect(dialog).toContainText("+91 98765 43210");
    await dialog.getByRole("button", { name: booking.done.button }).click();
    await expect(dialog).toBeHidden();
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

  test("skip link is the first tab stop and moves focus to main", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "Safari leaves links out of the Tab order unless the user turns that on; the Chromium projects cover keyboard order");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: header.skipLink.label });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    // Tailwind v4's not-sr-only resets padding; the pill must keep its own.
    expect(await skip.evaluate((el) => getComputedStyle(el).paddingLeft)).toBe("20px");

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

  test("learning tools: blend a word, switch tool and read a word's sounds", async ({ page }) => {
    await page.goto("/");
    const { blend, tools, reader } = classroom;
    const word = blend.words[0];

    for (const part of word.parts) {
      await page.getByRole("button", { name: blend.soundLabel.replace("{sound}", part), exact: true }).click();
    }
    await expect(page.getByText(blend.success.replace("{word}", word.word))).toBeVisible();

    const readerTab = tools.items.find((t) => t.id === "reader")!;
    await page.getByRole("tab", { name: readerTab.label }).click();
    const panel = page.getByRole("tabpanel", { name: readerTab.label });
    await panel.getByRole("button", { name: "the", exact: true }).click();
    await expect(panel.getByText(reader.tricky)).toBeVisible();
  });

  test("story reels open the video dialog", async ({ page }) => {
    await page.goto("/");
    const reel = stories.reels[1];

    await page.getByRole("button", { name: stories.playLabel.replace("{quote}", reel.quote) }).click();

    const dialog = page.getByRole("dialog", { name: stories.video.label });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(reel.quote);
    await dialog.getByRole("button", { name: stories.video.close }).last().click();
    await expect(dialog).toBeHidden();
  });

  test("header menu opens the section links on smaller screens", async ({ page }) => {
    await page.goto("/");
    const menu = page.getByRole("button", { name: header.menuLabel });
    test.skip(!(await menu.isVisible()), "the desktop header shows its links inline");

    await menu.click();
    const nav = page.getByRole("navigation", { name: header.mobileNavLabel });
    await expect(nav).toBeVisible();
    await nav.getByRole("link", { name: "FAQ" }).click();
    await expect(nav).toBeHidden();
    await expect(page.locator("#faq")).toBeInViewport();
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
