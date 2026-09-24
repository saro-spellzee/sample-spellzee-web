import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { book, booking, classroom, clm, educators, faq, footer, header, hero, motion, stories } from "../../src/features/homepage/content";

/** A step-1 difficulty card the booking tests pick, by its title from the content. */
const difficulty = booking.difficulties.items.find((d) => d.id === "comp")!.title;

/** Switches the learning tools to one tool and returns its panel. */
async function openTool(page: Page, id: (typeof classroom.tools.items)[number]["id"]) {
  const label = classroom.tools.items.find((t) => t.id === id)!.label;
  await page.getByRole("tab", { name: label, exact: true }).click();
  return page.getByRole("tabpanel", { name: label });
}

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

/** How many CSS animations are playing on the page right now. */
const runningAnimations = (page: Page) =>
  page.evaluate(() => document.getAnimations().filter((a) => a instanceof CSSAnimation && a.playState === "running").length);

const horizontalOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe("homepage", () => {
  // These checks are about content and widgets, so they run with reduced motion (a real setting,
  // which the page honours). With motion on, the decorative animations hold headless Firefox and
  // WebKit on this laptop to 13-19 frames a second (60 with reduced motion), and every Playwright
  // step waits on frames: with four browsers at once, clicks took seconds, one was dropped, and a
  // page's load event went unreported. Motion itself is tested with motion on at the end of this
  // file, and its timing (rotator, auto-advance, toast, canvases) in the unit tests with fake timers.
  test.use({ reducedMotion: "reduce" });

  test("renders with an h1, no errors and no horizontal overflow", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Scroll the whole page a screen at a time so lazy images and in-view effects load. Each jump
    // is instant (the page's CSS scrolls smoothly otherwise) and is seen by the next frame's
    // in-view checks, which run after the frame callback that made it.
    await page.evaluate(async () => {
      const frame = () => new Promise((r) => requestAnimationFrame(r));
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo({ top: y, behavior: "instant" });
        await frame();
      }
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
      await frame();
    });
    // Every image in the page's width must load. The community marquee's repeat copies sit off to
    // the side and stay lazy until they drift into view (same URL as the visible copy), so skip those.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const width = document.documentElement.clientWidth;
          return [...document.images]
            .filter((img) => {
              const r = img.getBoundingClientRect();
              const offCanvas = r.right <= 0 || r.left >= width;
              return !img.complete && !offCanvas;
            })
            .map((img) => `${img.currentSrc || img.src} at y=${Math.round(img.getBoundingClientRect().top + scrollY)}`);
        }),
      )
      .toEqual([]);

    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test("in-page links point at real targets", async ({ page }) => {
    await page.goto("/");

    // Without JavaScript the primary CTA still goes to the "How it works" section.
    await expect(page.getByRole("link", { name: hero.primaryCta.label })).toHaveAttribute("href", hero.primaryCta.href);

    const hashes = await page.$$eval("a[href^='#']", (links) => [...new Set(links.map((a) => a.getAttribute("href")!))]);
    expect(hashes.length).toBeGreaterThan(0);
    for (const hash of hashes) {
      await expect(page.locator(hash), `${hash} has a target`).toHaveCount(1);
    }
  });

  // The E2E server is a production build with no LEADS_WEBHOOK_URL, so the Server Action
  // must fail loudly: a generic error, the answers kept, and never a fake confirmation.
  test("booking dialog: both steps, then never a confirmation the server didn't give", async ({ page }) => {
    test.skip(!!process.env.LEADS_WEBHOOK_URL, "a webhook is configured for this run");
    await page.goto("/");
    await page.getByRole("link", { name: hero.primaryCta.label }).click();
    const dialog = page.getByRole("dialog");

    await dialog.getByRole("button", { name: booking.continue }).click();
    await expect(dialog.getByRole("alert")).toHaveText(booking.errors.kid);
    await expect(dialog.getByLabel(booking.kid.label)).toBeFocused();

    await dialog.getByLabel(booking.kid.label).fill("Aarav");
    await dialog.getByLabel(booking.grade.label).fill("Grade 3");
    await dialog.getByRole("button", { name: difficulty }).click();
    await dialog.getByRole("button", { name: booking.continue }).click();

    await expect(dialog.getByRole("heading", { name: booking.steps[1].title })).toBeVisible();
    const parent = dialog.getByLabel(booking.parent.label);
    await parent.fill("Meera Iyer");
    await dialog.getByLabel(booking.phone.label).fill("98765 43210");
    // Tap the drawn box, as a parent would: the native checkbox is visually hidden inside its label.
    const consent = dialog.getByRole("checkbox");
    await dialog.locator("label", { has: page.getByRole("checkbox") }).click({ position: { x: 11, y: 12 } });
    await expect(consent).toBeChecked();
    await dialog.getByRole("button", { name: new RegExp(booking.submit.call) }).click();

    const failed = booking.errors.failed.replace("{phone}", booking.done.support.call.number);
    await expect(dialog.getByRole("alert")).toHaveText(failed);
    await expect(dialog.getByRole("heading", { name: booking.done.title.replace("{parent}", "Meera") })).toHaveCount(0);
    await expect(parent).toHaveValue("Meera Iyer");
    await expect(dialog.getByRole("button", { name: new RegExp(booking.submit.call) })).toBeEnabled();
  });

  test("booking and newsletter inputs are at least 16px on phones, so iOS doesn't zoom on focus", async ({ page, isMobile }) => {
    test.skip(!isMobile, "only phones zoom on focus");
    await page.goto("/");
    await page.getByRole("link", { name: hero.primaryCta.label }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(booking.kid.label).fill("Aarav");
    await dialog.getByLabel(booking.grade.label).fill("Grade 3");
    await dialog.getByRole("button", { name: difficulty }).click();
    await dialog.getByRole("button", { name: booking.continue }).click();
    await expect(dialog.getByLabel(booking.parent.label)).toBeVisible();
    const sizes = await page.$$eval("input:not([type=checkbox]):not([type=radio]):not([tabindex='-1']), select, textarea", (els) =>
      els.map((el) => ({ name: el.getAttribute("name") ?? el.id, px: parseFloat(getComputedStyle(el).fontSize) })),
    );
    expect(sizes.length).toBeGreaterThan(2);
    expect(sizes.filter((s) => s.px < 16)).toEqual([]);
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

  // The learning tools are split over two short tests rather than one long one: every click waits
  // for its target to hold still, which in headless WebKit here can take over a second a step.
  test("learning tools: blend a word, then flip a flashcard", async ({ page }) => {
    await page.goto("/");
    const { blend, flashcards } = classroom;

    // Blend (the tool on show at load): the sounds in order build the word.
    const word = blend.words[0];
    for (const part of word.parts) {
      await page.getByRole("button", { name: blend.soundLabel.replace("{sound}", part), exact: true }).click();
    }
    await expect(page.getByText(blend.success.replace("{word}", word.word))).toBeVisible();

    // Flashcards: the 3D card flips to its back face, which then names the button.
    const deck = await openTool(page, "flashcards");
    await deck.getByRole("button", { name: flashcards.tap }).click();
    await expect(deck.getByRole("button", { name: flashcards.say.replace("{grapheme}", flashcards.deck[0].grapheme) })).toBeVisible();
  });

  test("learning tools: answer the worksheet, read a sight word, tick an assignment", async ({ page }) => {
    await page.goto("/");
    const { worksheet, reader, progress } = classroom;

    const sheet = await openTool(page, "worksheet");
    const q = worksheet.sets[0][0];
    await sheet.getByRole("group", { name: `${q.before}${worksheet.blank}${q.after}` }).getByRole("button", { name: q.options[q.answer], exact: true }).click();
    await expect(sheet.getByText(worksheet.score.replace("{n}", "1"))).toBeVisible();

    const stage = await openTool(page, "reader");
    const sight = reader.words.find((w) => w.sounds === null)!;
    await stage.getByRole("button", { name: sight.text, exact: true }).click();
    await expect(stage.getByText(reader.tricky)).toBeVisible();

    const list = await openTool(page, "progress");
    const open = progress.initial.indexOf(false);
    const done = progress.initial.filter(Boolean).length + 1;
    await list.getByRole("button", { name: progress.items[open].title }).click();
    await expect(list.getByText(`${Math.round((done / progress.items.length) * 100)}%`)).toBeVisible();
  });

  test("story reels scroll with the arrows and open the video dialog", async ({ page }) => {
    await page.goto("/");
    const reel = stories.reels[1];
    const reelButton = page.getByRole("button", {
      name: stories.playLabel.replace("{kind}", reel.kind).replace("{quote}", reel.quote).replace("{tag}", reel.tag),
    });

    // More reels than fit: Next scrolls the row sideways and Previous brings it back. The scroll is
    // smooth, so read where it comes to rest (the first snap point sits a hair past 0, the row's inset).
    const row = reelButton.locator("..");
    const settled = () =>
      row.evaluate(
        (el) =>
          new Promise<number>((resolve) => {
            let last = Number.NaN;
            const check = () => (el.scrollLeft === last ? resolve(last) : ((last = el.scrollLeft), requestAnimationFrame(() => requestAnimationFrame(check))));
            check();
          }),
      );
    const start = await settled();
    await page.getByRole("button", { name: stories.next }).click();
    await expect.poll(settled).toBeGreaterThan(start + 50);
    const scrolled = await settled();
    await page.getByRole("button", { name: stories.previous }).click();
    await expect.poll(settled).toBeLessThan(scrolled - 50);

    await reelButton.click();
    const dialog = page.getByRole("dialog", { name: stories.video.label });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(reel.quote);
    await dialog.getByRole("button", { name: stories.video.close }).last().click();
    await expect(dialog).toBeHidden();
    await expect(reelButton).toBeFocused();

    await reelButton.press("Enter");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(reelButton).toBeFocused();
  });

  test("header menu on phones: opens the section links, closes on Escape, and a link goes to its section", async ({ page, isMobile }) => {
    test.skip(!isMobile, "wider screens show the section links inline, with no menu button");
    await page.goto("/");
    const menu = page.getByRole("button", { name: header.menuLabel });
    const nav = page.getByRole("navigation", { name: header.mobileNavLabel });
    const faqLink = header.nav.find((item) => item.href === "#faq")!;

    await menu.click();
    await expect(nav).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
    await expect(menu).toBeFocused();

    await menu.click();
    await nav.getByRole("link", { name: faqLink.label }).click();
    await expect(nav).toBeHidden();
    await expect(page.locator(faqLink.href)).toBeInViewport();
  });

  test("hero tags show their tooltip on hover and on tap, and Escape dismisses it", async ({ page, isMobile }) => {
    test.skip(isMobile, "the floating hero tags are hidden on phones");
    await page.goto("/");
    const [first, second] = hero.tags;
    const tag = (label: string) => page.locator("#top").getByRole("button", { name: label, exact: true });
    const tip = (text: string) => page.getByRole("tooltip", { name: text });

    await expect(tip(second.tip)).toHaveCSS("opacity", "0");
    await tag(second.label).hover();
    await expect(tip(second.tip)).toHaveCSS("opacity", "1");

    await tag(first.label).click();
    await expect(tag(first.label)).toHaveAttribute("aria-expanded", "true");
    await expect(tip(first.tip)).toHaveCSS("opacity", "1");
    await page.keyboard.press("Escape");
    await expect(tag(first.label)).toHaveAttribute("aria-expanded", "false");
    await expect(tip(first.tip)).toHaveCSS("opacity", "0"); // even with the pointer still over it
  });

  test("mentor filters show one programme's mentors", async ({ page }) => {
    await page.goto("/");
    const filter = educators.filters.find((f) => f.id !== "all" && educators.mentors.some((m) => m.programme === f.id))!;
    const expected = educators.mentors.filter((m) => m.programme === filter.id);
    const tab = page.locator("#educators").getByRole("tab", { name: filter.label, exact: true });

    await tab.click();

    await expect(tab).toHaveAttribute("aria-selected", "true");
    const panel = page.getByRole("tabpanel", { name: filter.label });
    await expect(panel.getByRole("article")).toHaveCount(expected.length);
    await expect(panel.getByRole("heading", { name: expected[0].name })).toBeVisible();
  });

  test("how it works: a step highlights, and the sample report shows a skill's note and a week's focus", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#book");
    const { rings, plan } = book.report;
    const step = section.getByRole("button", { name: book.steps[0].title });
    const ring = rings.findIndex((_, i) => i !== book.report.initialRing);
    const week = plan.weeks.length - 1;

    await step.click();
    await expect(step).toHaveAttribute("aria-pressed", "true");

    await section.getByRole("button", { name: rings[ring].label }).click();
    await expect(section.getByText(rings[ring].note)).toBeVisible();

    await section.getByRole("button", { name: plan.weekLabel.replace("{n}", String(week + 1)) }).click();
    await expect(section.getByText(plan.weeks[week].detail)).toBeVisible();
  });

  test("live-feedback toast appears once the stories are in view, and can be dismissed", async ({ page }) => {
    await page.goto("/");
    const dismiss = page.getByRole("button", { name: stories.feedback.dismiss });
    await expect(dismiss).toHaveCount(0);

    await page.locator("#stories").getByRole("heading", { level: 2 }).scrollIntoViewIfNeeded();
    await expect(dismiss).toBeVisible();
    await expect(page.getByText(stories.feedback.live)).toBeVisible();

    await dismiss.click();
    await expect(dismiss).toHaveCount(0);
    await expect(page.getByText(stories.feedback.live)).toHaveCount(0);
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

// A slow phone can show the form before React hydrates. The newsletter must still submit,
// through its Server Action, and never as a GET that puts the email in the URL.
test.describe("before hydration (no JavaScript)", () => {
  // Reduced motion turns off the page's smooth scrolling, which never settles for Playwright's
  // "is it still moving?" check once JavaScript is off.
  test.use({ javaScriptEnabled: false, reducedMotion: "reduce" });

  test("newsletter posts to its Server Action and shows the server's answer", async ({ page }) => {
    test.skip(!!process.env.NEWSLETTER_WEBHOOK_URL, "a webhook is configured for this run");
    await page.goto("/");
    await page.getByLabel(footer.newsletter.label).fill("parent@example.com");

    const [request] = await Promise.all([
      page.waitForRequest((r) => r.isNavigationRequest() && r.method() === "POST"),
      page.getByRole("button", { name: footer.newsletter.submit }).click(),
    ]);

    expect(new URL(request.url()).search).toBe("");
    await expect(page.getByRole("status").filter({ hasText: footer.newsletter.errors.failed })).toBeVisible();
    await expect(page.getByText(footer.newsletter.success)).toHaveCount(0);
    expect(page.url()).not.toContain("parent%40example.com");
  });
});

// The default experience, for what is about motion. Kept to a few steps each: with motion on,
// headless browsers render this page slowly (see the note at the top of "homepage").
test.describe("homepage with motion on", () => {
  test("runs its animations without errors or sideways scroll", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await expect.poll(() => runningAnimations(page)).toBeGreaterThan(0);

    // The animated sections further down: the skill map's brain canvas, then the stories with the
    // live-feedback toast (which only appears once they're in view).
    await page.locator("#clm").getByRole("heading", { level: 2 }).scrollIntoViewIfNeeded();
    await page.locator("#stories").getByRole("heading", { level: 2 }).scrollIntoViewIfNeeded();
    await expect(page.getByText(stories.feedback.live)).toBeVisible();

    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test("Pause motion freezes the page's animations, and Play motion resumes them", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => runningAnimations(page)).toBeGreaterThan(0);

    await page.getByRole("button", { name: motion.pause }).click();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
    await expect.poll(() => runningAnimations(page)).toBe(0);

    await page.getByRole("button", { name: motion.play }).click();
    await expect(page.locator("html")).not.toHaveAttribute("data-motion", "paused");
    await expect.poll(() => runningAnimations(page)).toBeGreaterThan(0);
  });

  test("the primary CTA opens the booking dialog instead of following its link, and Escape closes it", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: hero.primaryCta.label });

    await cta.click();
    const dialog = page.getByRole("dialog", { name: booking.steps[0].title });
    await expect(dialog).toBeVisible();
    await expect(page).not.toHaveURL(/#book$/);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(cta).toBeFocused();
  });
});
